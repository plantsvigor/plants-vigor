const { Order, orderStatusEnum } = require("../models/Order");
const Product = require("../models/Product");
const { sendOrderConfirmation, sendAdminOrderAlert } = require("../services/sendNotification");

const serialize = (doc) => ({
  id: doc.orderCode,
  userId: doc.userId,
  email: doc.email,
  products: doc.products || [],
  subtotal: doc.subtotal,
  delivery: doc.delivery,
  totalAmount: doc.totalAmount || doc.total, // Fallback for old orders
  payment: doc.payment,
  paymentId: doc.paymentId,
  address: doc.address,
  status: doc.status,
  createdAt: doc.createdAtMs || doc.createdAt,
  history: doc.history,
  shipment_id: doc.shipment_id,
  shiprocket_order_id: doc.shiprocket_order_id,
  awb_code: doc.awb_code,
  courier_name: doc.courier_name,
  tracking_url: doc.tracking_url,
  current_status: doc.current_status,
});

const generateCode = () => `PO${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 999)}`;

const getOrders = async (req, res) => {
  const { userId, email } = req.query;
  const filter = {};
  if (userId || email) {
    filter.$or = [];
    if (userId) filter.$or.push({ userId });
    if (email) filter.$or.push({ email: String(email).toLowerCase() });
  }
  const orders = await Order.find(filter).sort({ createdAtMs: -1 });
  res.json({ orders: orders.map(serialize) });
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      $or: [
        { userId: req.user._id.toString() },
        { email: req.user.email }
      ]
    }).sort({ createdAtMs: -1 });
    res.json({ orders: orders.map(serialize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  const order = await Order.findOne({ orderCode: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(serialize(order));
};

const createOrder = async (req, res) => {
  const now = Date.now();
  const order = await Order.create({
    ...req.body,
    email: req.body.email.toLowerCase(),
    orderCode: generateCode(),
    status: "Pending",
    createdAtMs: now,
    history: [{ status: "Pending", at: now }],
  });

  // Decrement product stock
  if (order.products && order.products.length > 0) {
    for (const item of order.products) {
      const baseId = item.productId.split("_")[0];
      await Product.findOneAndUpdate(
        { id: baseId },
        { $inc: { stock: -item.quantity } }
      );
    }
  }

  // Asynchronously trigger customer confirmation and admin alert
  try {
    sendOrderConfirmation(order);
    sendAdminOrderAlert(order);
  } catch (notifyErr) {
    console.error(`[ORDER] Background dispatch notification error:`, notifyErr);
  }

  // Asynchronously trigger Shiprocket integration in the background
  const shiprocketService = require("../services/shiprocketService");
  setTimeout(async () => {
    try {
      // === STAGE 1: Shiprocket Order Creation (REQUIRED) ===
      console.log(`[ORDER-SHIPROCKET] STAGE 1: Triggering automatic Shiprocket creation for order ${order.orderCode}...`);
      const shipmentInfo = await shiprocketService.createShiprocketOrder(order);
      
      // Save all parsed values into MongoDB with proper fallbacks
      order.shipment_id = shipmentInfo.shipment_id ? String(shipmentInfo.shipment_id) : null;
      order.shiprocket_order_id = shipmentInfo.shiprocket_order_id ? String(shipmentInfo.shiprocket_order_id) : null;
      order.awb_code = shipmentInfo.awb_code ? String(shipmentInfo.awb_code) : null;
      order.courier_name = shipmentInfo.courier_name ? String(shipmentInfo.courier_name) : null;
      order.tracking_url = shipmentInfo.tracking_url ? String(shipmentInfo.tracking_url) : null;
      order.awb_assignment_status = shipmentInfo.awb_code ? "ASSIGNED" : "PENDING";
      order.current_status = "NEW"; // Synced successfully, starts as NEW
      await order.save();

      console.log(`[ORDER-SHIPROCKET] Stage 1 successfully synced with Shiprocket for ${order.orderCode}. Shipment ID: ${order.shipment_id}`);
      
      // === STAGE 2: Courier assignment/AWB generation (OPTIONAL) ===
      if (!order.awb_code && order.shipment_id) {
        try {
          console.log(`[ORDER-SHIPROCKET] STAGE 2 (Optional): Running courier auto-assignment for shipment ${order.shipment_id}...`);
          const isCOD = order.payment === "COD";
          const awbInfo = await shiprocketService.assignCourierAndAWB(
            order.shipment_id,
            order.address.pincode,
            isCOD
          );
          
          order.awb_code = awbInfo.awb_code ? String(awbInfo.awb_code) : null;
          order.courier_name = awbInfo.courier_name ? String(awbInfo.courier_name) : null;
          order.tracking_url = awbInfo.tracking_url ? String(awbInfo.tracking_url) : null;
          order.awb_assignment_status = "ASSIGNED";
          order.current_status = "AWB Assigned";
          await order.save();

          console.log(`[SHIPROCKET SUCCESS] AWB generated successfully`);
          console.log(`[SHIPROCKET SUCCESS] Tracking URL saved`);
          console.log(`[SHIPROCKET SUCCESS] AWB Code: ${order.awb_code}`);
        } catch (awbErr) {
          // 4 & 5 & 11. Courier assignment fails: log warnings and do not fail the order creation
          console.warn("\n=================== [SHIPROCKET COURIER ASSIGNMENT WARNING] ===================");
          console.warn(`[SHIPROCKET WARNING] Courier assignment skipped for order ${order.orderCode}`);
          console.warn(`[SHIPROCKET WARNING] Shiprocket may auto-assign courier later`);
          
          const is403 = awbErr.message.includes("403") || (awbErr.response && awbErr.response.status === 403) || String(awbErr).includes("403");
          if (is403) {
            console.warn(`[SHIPROCKET WARNING] Manual assignment API returned 403`);
            console.warn(`[SHIPROCKET WARNING] Shiprocket account does not allow manual courier assignment.`);
          } else {
            console.warn(`[SHIPROCKET WARNING] Assignment API failed with: ${awbErr.message}`);
          }
          console.warn("===============================================================================\n");

          // Save pending status cleanly
          order.awb_assignment_status = "PENDING";
          order.current_status = "NEW";
          await order.save();
        }
      }
      
      // Success console logs matching Requirement 6/5
      console.log(`[SHIPROCKET SUCCESS] Order created successfully`);
      console.log(`[SHIPROCKET SUCCESS] Shiprocket Order ID: ${order.shiprocket_order_id}`);
      console.log(`[SHIPROCKET SUCCESS] Shipment ID: ${order.shipment_id}`);
      console.log(`[SHIPROCKET SUCCESS] AWB Code: ${order.awb_code || "N/A"}`);
      console.log(`[SHIPROCKET SUCCESS] Courier: ${order.courier_name || "N/A"}`);
      console.log(`[SHIPROCKET SUCCESS] Tracking URL: ${order.tracking_url || "N/A"}`);
    } catch (srErr) {
      console.error(`[ORDER-SHIPROCKET] Failed to auto-create Shiprocket order/AWB for ${order.orderCode}:`, srErr.message);
      // Fail gracefully: update order's current_status with details to allow manual retries in the admin panel
      try {
        order.current_status = `Failed: ${srErr.message.substring(0, 100)}`;
        await order.save();
      } catch (saveErr) {
        console.error(`[ORDER-SHIPROCKET] Could not update failure status for order ${order.orderCode}:`, saveErr);
      }
    }
  }, 100);

  res.status(201).json(serialize(order));
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!orderStatusEnum.includes(status)) return res.status(400).json({ message: "Invalid status" });
  const order = await Order.findOne({ orderCode: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  
  const oldStatus = order.status;
  order.status = status;
  order.history.push({ status, at: Date.now() });
  await order.save();

  // If order status is changed to Cancelled, restore the stock
  if (status === "Cancelled" && oldStatus !== "Cancelled") {
    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        const baseId = item.productId.split("_")[0];
        await Product.findOneAndUpdate(
          { id: baseId },
          { $inc: { stock: item.quantity } }
        );
      }
    }
  } 
  // If order is uncancelled (changed from Cancelled to something else)
  else if (oldStatus === "Cancelled" && status !== "Cancelled") {
    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        const baseId = item.productId.split("_")[0];
        await Product.findOneAndUpdate(
          { id: baseId },
          { $inc: { stock: -item.quantity } }
        );
      }
    }
  }

  res.json(serialize(order));
};

module.exports = { getOrders, getMyOrders, getOrderById, createOrder, updateStatus };
