import mongoose from "mongoose";
import connectDB from "../db.js";

// Connect to MongoDB
connectDB();

async function removeUsernameIndex() {
  try {
    console.log("Connected to MongoDB");

    const usersCollection = mongoose.connection.db.collection("users");

    // Check if the index exists
    const indexes = await usersCollection.indexes();
    const hasUsernameIndex = indexes.some((idx) => idx.name === "username_1");

    if (hasUsernameIndex) {
      const result = await usersCollection.dropIndex("username_1");
      console.log("Dropped index:", result);
    } else {
      console.log("Index 'username_1' does not exist.");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error removing index:", error);
  }
}

removeUsernameIndex();
