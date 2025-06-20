import mongoose from "mongoose";

async function connectToDb() {
  await mongoose.connect(process.env.MONGODB_CONNECT);
}

export default connectToDb;
