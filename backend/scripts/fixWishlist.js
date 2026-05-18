const mongoose = require("mongoose");
require("dotenv").config();

const fixWishlist = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const wishlistExists = collections.some(c => c.name === "wishlists");
    
    if (wishlistExists) {
      console.log("Dropping wishlist indexes...");
      await mongoose.connection.db.collection("wishlists").dropIndexes();
      console.log("Indexes dropped successfully");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

fixWishlist();
