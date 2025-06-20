import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    const mongoURL = process.env.MONGODB_CONNECT;
    await mongoose.connect(mongoURL);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

export default connectToDb;
