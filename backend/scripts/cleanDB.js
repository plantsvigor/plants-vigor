const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const cleanDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const collections = await mongoose.connection.db.listCollections().toArray();
    const recentCollection = collections.find(c => c.name === "recents");

    if (recentCollection) {
      console.log("Dropping stale index userKey_1 from recents...");
      try {
        await mongoose.connection.db.collection("recents").dropIndex("userKey_1");
        console.log("Stale index dropped successfully.");
      } catch (err) {
        console.log("Index not found or already dropped.");
      }
    }

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning DB:", error);
    process.exit(1);
  }
};

cleanDB();
