import express from "express";
import {
  register,
  login,
  logout,
  profile,
  checkValidUser,
} from "../controllers/auth.controller.js";

import authMiddleware  from "../middlewares/auth.middleware.js";
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/logout", authMiddleware, logout);
authRouter.get("/profile", authMiddleware, profile);
authRouter.get("/check", authMiddleware, checkValidUser);

export default authRouter;
