const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "admin@greenbloom.com";
    const password = "adminpassword123";
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Admin user already exists");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name: "Admin User",
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true
    });

    console.log("Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
