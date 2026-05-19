const express = require("express");
const { 
  login, 
  signup, 
  sendOtp, 
  loginGoogle, 
  getCurrent, 
  logout,
  updateProfile,
  changePassword,
  sendForgotPasswordOTP,
  resetForgottenPassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/send-otp", sendOtp);
router.post("/google", loginGoogle);
router.get("/me", protect, getCurrent);
router.post("/logout", logout);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password-otp", protect, sendForgotPasswordOTP);
router.post("/reset-forgotten-password", protect, resetForgottenPassword);

module.exports = router;
