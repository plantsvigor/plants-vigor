const mongoose = require("mongoose");

const orderStatusEnum = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"];

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null },
    email: { type: String, required: true, trim: true, lowercase: true },
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    subtotal: { type: Number, required: true },
    delivery: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    payment: { type: String, enum: ["COD", "Razorpay"], required: true },
    paymentId: { type: String },
    address: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: { type: String, enum: orderStatusEnum, default: "Pending" },
    createdAtMs: { type: Number, required: true, default: () => Date.now() },
    history: [
      {
        status: { type: String, enum: orderStatusEnum, required: true },
        at: { type: Number, required: true },
      },
    ],
    // Shiprocket fields
    shipment_id: { type: String, default: null },
    shiprocket_order_id: { type: String, default: null },
    awb_code: { type: String, default: null },
    courier_name: { type: String, default: null },
    tracking_url: { type: String, default: null },
    current_status: { type: String, default: null },
    awb_assignment_status: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = {
  Order: mongoose.model("Order", orderSchema),
  orderStatusEnum,
};
