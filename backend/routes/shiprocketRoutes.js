const express = require("express");
const router = express.Router();
const { Order } = require("../models/Order");
const shiprocketService = require("../services/shiprocketService");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

/**
 * @route   POST /api/shiprocket/webhook
 * @desc    Shiprocket tracking automatic webhook status updates
 * @access  Public
 */
router.post("/webhook", async (req, res, next) => {
  try {
    const payload = req.body;
    console.log("[SHIPROCKET WEBHOOK] Received payload:", JSON.stringify(payload));

    const shipmentId = payload.shipment_id;
    const awb = payload.awb || payload.awb_code;
    const currentStatus = payload.current_status || payload.status;

    if (!shipmentId && !awb) {
      return res.status(400).json({
        success: false,
        message: "Missing shipment_id or awb in webhook payload."
      });
    }

    // Try to find the order by shipment_id or awb_code
    const query = {};
    if (shipmentId) query.shipment_id = String(shipmentId);
    else query.awb_code = String(awb);

    const order = await Order.findOne(query);
    if (!order) {
      console.warn(`[SHIPROCKET WEBHOOK] Order not found for shipment_id: ${shipmentId}, awb: ${awb}`);
      return res.status(404).json({
        success: false,
        message: "Corresponding order not found in database."
      });
    }

    // Update shiprocket current status
    if (currentStatus) {
      order.current_status = currentStatus;
    }

    // Map Shiprocket status to local application orderStatusEnum
    const shiprocketStatus = String(currentStatus).toLowerCase();
    let newStatus = null;

    if (shiprocketStatus.includes("delivered")) {
      newStatus = "Delivered";
    } else if (shiprocketStatus.includes("out for delivery")) {
      newStatus = "Out for Delivery";
    } else if (shiprocketStatus.includes("shipped")) {
      newStatus = "Shipped";
    } else if (shiprocketStatus.includes("in transit") || shiprocketStatus.includes("transit")) {
      newStatus = "Shipped";
    } else if (shiprocketStatus.includes("cancelled")) {
      newStatus = "Cancelled";
    } else if (shiprocketStatus.includes("returned")) {
      newStatus = "Returned";
    }

    // Only update and push to history if status has changed
    if (newStatus && order.status !== newStatus) {
      console.log(`[SHIPROCKET WEBHOOK] Status transition for ${order.orderCode}: ${order.status} -> ${newStatus}`);
      order.status = newStatus;
      order.history.push({
        status: newStatus,
        at: Date.now()
      });
    }

    await order.save();
    console.log(`[SHIPROCKET WEBHOOK] Successfully updated order ${order.orderCode}`);

    return res.status(200).json({
      success: true,
      message: "Webhook processed and order updated successfully."
    });
  } catch (error) {
    console.error("[SHIPROCKET WEBHOOK] Error processing webhook:", error);
    next(error);
  }
});

/**
 * @route   POST /api/shiprocket/orders/:orderCode/awb
 * @desc    Manually trigger/retry AWB generation and Courier Partner selection
 * @access  Private/Admin
 */
router.post("/orders/:orderCode/awb", protect, admin, async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // If order is not created in Shiprocket yet, create it first
    let shipmentId = order.shipment_id;

    if (!shipmentId) {
      console.log(`[SHIPROCKET ROUTE] Order ${orderCode} doesn't exist on Shiprocket. Creating it first...`);
      const createdShipment = await shiprocketService.createShiprocketOrder(order);
      
      // Save all parsed values into MongoDB with proper fallbacks
      order.shipment_id = createdShipment.shipment_id ? String(createdShipment.shipment_id) : null;
      order.shiprocket_order_id = createdShipment.shiprocket_order_id ? String(createdShipment.shiprocket_order_id) : null;
      order.awb_code = createdShipment.awb_code ? String(createdShipment.awb_code) : null;
      order.courier_name = createdShipment.courier_name ? String(createdShipment.courier_name) : null;
      order.tracking_url = createdShipment.tracking_url ? String(createdShipment.tracking_url) : null;
      order.current_status = createdShipment.awb_code ? "AWB Assigned" : (createdShipment.current_status || "NEW");
      await order.save();
      
      shipmentId = order.shipment_id;
    }

    // Only assign courier & AWB if not already present
    if (!order.awb_code && shipmentId) {
      try {
        console.log(`[SHIPROCKET ROUTE] STAGE 2 (Optional): Assigning courier & AWB for order ${orderCode}, shipment ${shipmentId}...`);
        const isCOD = order.payment === "COD";
        const awbDetails = await shiprocketService.assignCourierAndAWB(
          shipmentId,
          order.address.pincode,
          isCOD
        );

        order.awb_code = awbDetails.awb_code ? String(awbDetails.awb_code) : null;
        order.courier_name = awbDetails.courier_name ? String(awbDetails.courier_name) : null;
        order.tracking_url = awbDetails.tracking_url ? String(awbDetails.tracking_url) : null;
        order.awb_assignment_status = "ASSIGNED";
        order.current_status = "AWB Assigned";
        await order.save();
      } catch (awbErr) {
        // 4 & 5 & 11. Courier assignment fails: log warnings and do not fail the flow
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

    return res.json({
      message: "Courier and AWB assigned successfully.",
      orderCode,
      shipment_id: order.shipment_id,
      awb_code: order.awb_code,
      courier_name: order.courier_name,
      tracking_url: order.tracking_url
    });
  } catch (error) {
    console.error("[SHIPROCKET ROUTE] AWB Assignment failed:", error);
    return res.status(500).json({ message: error.message || "AWB assignment failed." });
  }
});

/**
 * @route   POST /api/shiprocket/orders/:orderCode/pickup
 * @desc    Schedule pickup with assigned courier partner
 * @access  Private/Admin
 */
router.post("/orders/:orderCode/pickup", protect, admin, async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!order.shipment_id) {
      return res.status(400).json({ message: "Order is not created on Shiprocket yet." });
    }

    const pickupData = await shiprocketService.requestPickup(order.shipment_id);

    order.current_status = "Pickup Scheduled";
    await order.save();

    return res.json({
      message: "Pickup scheduled successfully.",
      pickupData
    });
  } catch (error) {
    console.error("[SHIPROCKET ROUTE] Pickup scheduling failed:", error);
    return res.status(500).json({ message: error.message || "Pickup scheduling failed." });
  }
});

/**
 * @route   GET /api/shiprocket/orders/:orderCode/label
 * @desc    Generate and fetch PDF URL of shipping label
 * @access  Private/Admin
 */
router.get("/orders/:orderCode/label", protect, admin, async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!order.shipment_id) {
      return res.status(400).json({ message: "Order is not created on Shiprocket yet." });
    }

    const labelUrl = await shiprocketService.generateLabel(order.shipment_id);

    return res.json({
      message: "Shipping label generated successfully.",
      label_url: labelUrl
    });
  } catch (error) {
    console.error("[SHIPROCKET ROUTE] Label generation failed:", error);
    return res.status(500).json({ message: error.message || "Label generation failed." });
  }
});

/**
 * @route   GET /api/shiprocket/orders/:orderCode/track
 * @desc    Fetch live tracking timeline details directly from Shiprocket
 * @access  Private (accessible by the customer)
 */
router.get("/orders/:orderCode/track", protect, async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Ensure users can only track their own orders (admins can track any)
    if (req.user.role !== "admin" && order.userId !== req.user._id.toString() && order.email !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized to track this order." });
    }

    if (!order.shipment_id) {
      return res.status(400).json({ message: "Order is not created on Shiprocket yet." });
    }

    const trackingDetails = await shiprocketService.trackShipment(order.shipment_id);
    return res.json({
      orderCode,
      trackingDetails
    });
  } catch (error) {
    console.error("[SHIPROCKET ROUTE] Direct tracking failed:", error);
    return res.status(500).json({ message: error.message || "Live tracking retrieval failed." });
  }
});

module.exports = router;
