const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
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
});

const roleFromEmail = (email) => (email.toLowerCase().includes("admin") ? "admin" : "customer");

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Greenbloom" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Verify your email",
      text: `Your OTP is: ${otpCode}`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
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
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

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
    generateToken(res, user._id);

    res.status(201).json(toResponseUser(user));
  } catch (err) {
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

module.exports = { login, signup, sendOtp, loginGoogle, getCurrent, logout };
