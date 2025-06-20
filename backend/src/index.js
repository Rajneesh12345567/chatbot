
import 'dotenv/config';
console.log("JWT_SECRET value is:", process.env.JWT_SECRET);

import express from "express";

import authRouter from "./routes/auth.routes.js";
import connectToDb from "./config/db.js";
import rediClient from "./config/redis.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import chatRouter from "./routes/chat.routes.js";

const app = express();
const port = process.env.PORT || 3000;

// ✅ Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in .env file");
  process.exit(1); // Stop the server
}

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
];

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Routes
app.use("/user", authRouter);
app.use("/chat", chatRouter);

// ✅ Server start logic
const startServer = async () => {
  try {
    await Promise.all([connectToDb(), rediClient.connect()]);
    console.log("✅ Database connected successfully");

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();
