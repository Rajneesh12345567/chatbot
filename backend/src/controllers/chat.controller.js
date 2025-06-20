import main from "../config/generateAiResponse.js";
import Chat from "../models/chat.model.js";

// POST /chat – Send Message (New or Existing Chat)
export const chatGpt = async (req, res) => {
  const { msg } = req.body;
  const chatId = req.params.chatId;
  const userId = req.user._id;

  try {
    let chat;

    // Fetch or create user chat history
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
    }

    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // Build the prompt message from history + current msg
    const MAX_HISTORY = 10;
    const promptMessage = [
      ...chat.messages.slice(-MAX_HISTORY),
      { role: "user", parts: [{ text: msg }] },
    ];

    // Get AI response
    const answer = await main(promptMessage);

    // Add user and model response to history
    chat.messages.push({ role: "user", parts: [{ text: msg }] });
    chat.messages.push({ role: "model", parts: [{ text: answer }] });

    // Save to DB
    await chat.save();

    // Send back the updated chat
    res.json({
      success: true,
      chatId: chat._id,
      message: {
        user: { role: "user", parts: [{ text: msg }] },
        model: { role: "model", parts: [{ text: answer }] },
      },
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
};

// GET /chats/allChats – Get all chats of user
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });

    res.json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET /chat/:chatId – Get single chat
export const getChatById = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Error fetching chat:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
