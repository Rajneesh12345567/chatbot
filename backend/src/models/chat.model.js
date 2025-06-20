import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  parts: [{ text: String }],
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.model("chat", chatSchema);

export default Chat;
