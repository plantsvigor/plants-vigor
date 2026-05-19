const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { seedPlantData } = require("../models/PlantInfo");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedPlantData();
  } catch (error) {
    console.error("MongoDB connection failed, starting local in-memory MongoDB:", error.message);
    const memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`MongoDB fallback connected: ${conn.connection.host}`);
    await seedPlantData();
  }
};

module.exports = connectDB;
