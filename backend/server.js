const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the Greenbloom API" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "greenbloom-backend" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/recent", require("./routes/recentRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin-catalog", require("./routes/adminCatalogRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/plant-ai", require("./routes/plantAIRoutes"));
app.use("/api/reels", require("./routes/reelRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
