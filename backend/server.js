const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();

// Ensure critical env vars are present in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.MONGO_URI) {
    console.error("CRITICAL ERROR: Missing MONGO_URI environment variable!");
    process.exit(1);
  }
}

connectDB();

const app = express();

// Add basic logging for origin headers
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log(`[${req.method}] ${req.originalUrl} - Origin: ${req.headers.origin || 'none'}`);
  }
  next();
});

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim().replace(/\/$/, ""))
  : ["https://plants-vigor.vercel.app", "https://plants-vigor-nine.vercel.app", "http://localhost:5173", "http://localhost:5174"];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle OPTIONS preflight

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(mongoSanitize());
const xss = require("xss-clean");
app.use(xss());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Greenbloom API is running successfully." });
});

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
