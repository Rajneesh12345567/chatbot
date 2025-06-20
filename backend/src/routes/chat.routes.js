import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import { chatGpt, getChatById, getUserChats } from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.get("/allChats",authMiddleware, getUserChats);
chatRouter.get("/:chatId", authMiddleware, getChatById);
chatRouter.post("/:chatId", authMiddleware, chatGpt);
chatRouter.post("/", authMiddleware, chatGpt);

export default chatRouter;
