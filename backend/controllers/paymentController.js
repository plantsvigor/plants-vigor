const Razorpay = require("razorpay");
const crypto = require("crypto");

const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = Number(req.body.amount);
    if (!amount || isNaN(amount)) {
      return res.status(400).send("Invalid amount");
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occurred");

    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).send(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully", success: true });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!", success: false });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error!", success: false });
  }
};

module.exports = { createOrder, verifyPayment };
