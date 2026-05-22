const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { sendSignupOTP, sendRecoveryOTP } = require("../services/sendOTP");
const { sendWelcomeEmail } = require("../services/sendNotification");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const toResponseUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone || "",
});

const roleFromEmail = (email) => (email.toLowerCase().includes("admin") ? "admin" : "customer");

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[OTP] Initiating OTP generation for: ${normalizedEmail}`);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.warn(`[OTP] Signup blocked: User already exists for ${normalizedEmail}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`[OTP] Storing OTP for ${normalizedEmail} in database...`);
    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      createdAt: new Date() // Force fresh date
    });

    console.log(`[OTP] Sending OTP email to ${normalizedEmail} via Resend...`);
    await sendSignupOTP(normalizedEmail, otpCode);

    console.log(`[OTP] OTP email successfully sent to ${normalizedEmail}`);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(`[OTP ERROR] Failed to send OTP to ${req.body?.email}:`, err);
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!email || !password || !otp) {
      return res.status(400).json({ message: "Email, password, and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[SIGNUP] Attempting signup for email: ${normalizedEmail}`);
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.warn(`[SIGNUP] User already exists: ${normalizedEmail}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      console.warn(`[SIGNUP] No OTP record found for: ${normalizedEmail}`);
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // Precise application-level check for 5-minute expiry
    const otpAgeMs = Date.now() - otpRecord.createdAt.getTime();
    if (otpAgeMs > 5 * 60 * 1000) {
      console.warn(`[SIGNUP] OTP found but expired for ${normalizedEmail}. Age: ${Math.round(otpAgeMs / 1000)}s`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (otpRecord.otp !== otp) {
      console.warn(`[SIGNUP] Invalid OTP entered for ${normalizedEmail}. Expected ${otpRecord.otp}, got ${otp}`);
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    console.log(`[SIGNUP] OTP matches. Hashing password and creating user...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const role = roleFromEmail(normalizedEmail);

    const user = await User.create({
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      role,
      isVerified: true
    });

    await OTP.deleteOne({ _id: otpRecord._id });
    console.log(`[SIGNUP] User account created successfully for: ${normalizedEmail} (ID: ${user._id})`);
    
    // Asynchronously send the Welcome Email (it handles its own errors silently/log-only)
    try {
      sendWelcomeEmail(normalizedEmail, user.name);
    } catch (welcomeErr) {
      console.error(`[SIGNUP] Background Welcome email dispatch error:`, welcomeErr);
    }

    generateToken(res, user._id);
    res.status(201).json(toResponseUser(user));
  } catch (err) {
    console.error(`[SIGNUP ERROR] Signup failed for ${req.body?.email}:`, err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account was created with Google. Please use 'Continue with Google' to sign in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(res, user._id);
    res.json(toResponseUser(user));
  } catch (err) {
    next(err);
  }
};

const loginGoogle = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    const normalizedEmail = email.trim().toLowerCase();
    const role = roleFromEmail(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role,
        isVerified: true
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    generateToken(res, user._id);
    res.json(toResponseUser(user));
  } catch (err) {
    console.error("Google Login Error:", err);
    next(err);
  }
};

const getCurrent = async (req, res) => {
  if (req.user) {
    res.json({ user: toResponseUser(req.user) });
  } else {
    res.json({ user: null });
  }
};

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.json(toResponseUser(user));
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account was created with Google and doesn't have a password. You can set a password using the Forgot Password flow." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};



const sendForgotPasswordOTP = async (req, res, next) => {
  try {
    const email = req.user.email;
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log(`[FORGOT PASSWORD] Initiating password reset OTP for logged in user: ${normalizedEmail}`);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`[FORGOT PASSWORD] Storing OTP in database...`);
    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      createdAt: new Date()
    });

    console.log(`[FORGOT PASSWORD] Sending reset OTP email to ${normalizedEmail} via Resend...`);
    await sendRecoveryOTP(normalizedEmail, otpCode);

    console.log(`[FORGOT PASSWORD] Reset OTP email successfully sent to ${normalizedEmail}`);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(`[FORGOT PASSWORD ERROR] Failed to send OTP to ${req.user?.email}:`, err);
    next(err);
  }
};

const resetForgottenPassword = async (req, res, next) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
      return res.status(400).json({ message: "OTP and new password are required" });
    }

    const email = req.user.email;
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log(`[RESET PASSWORD] Attempting password reset for: ${normalizedEmail}`);

    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      console.warn(`[RESET PASSWORD] No OTP record found for: ${normalizedEmail}`);
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // Application level 5-minute expiry check
    const otpAgeMs = Date.now() - otpRecord.createdAt.getTime();
    if (otpAgeMs > 5 * 60 * 1000) {
      console.warn(`[RESET PASSWORD] Reset OTP found but expired for ${normalizedEmail}. Age: ${Math.round(otpAgeMs / 1000)}s`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (otpRecord.otp !== otp) {
      console.warn(`[RESET PASSWORD] Invalid OTP entered for ${normalizedEmail}. Expected ${otpRecord.otp}, got ${otp}`);
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    console.log(`[RESET PASSWORD] OTP matched successfully. Updating password...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findById(req.user._id);
    if (!user) {
      console.error(`[RESET PASSWORD ERROR] User record not found for ID: ${req.user._id}`);
      return res.status(404).json({ message: "User not found" });
    }

    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });
    console.log(`[RESET PASSWORD] Password updated successfully for: ${normalizedEmail}`);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(`[RESET PASSWORD ERROR] Password reset failed for ${req.user?.email}:`, err);
    next(err);
  }
};

module.exports = { 
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
};
