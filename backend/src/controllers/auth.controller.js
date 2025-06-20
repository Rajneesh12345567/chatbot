import rediClient from "../config/redis.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validateUserInput from "../utils/validator.js";

export const register = async (req, res) => {
  console.log("JWT_SECRET value is:", process.env.JWT_SECRET);

  try {
    validateUserInput(req.body);

    const { emailId, password } = req.body;
    const existingUser = await User.exists({ emailId });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...req.body,
      password: hashPassword,
    });

  const token = jwt.sign(
  { _id: user._id, emailId: user.emailId },
  process.env.JWT_SECRET, // ✅ Correct key from your .env file
  { expiresIn: "1h" }
);



    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    const { password: pass, __v, updatedAt, createdAt, ...safeUser } = user._doc;

    res.status(201).json({
      user: safeUser,
      message: "registered successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

   const token = jwt.sign(
  { _id: user._id, emailId: user.emailId },
  process.env.JWT_SECRET, // ✅ not JWT_KEY
  { expiresIn: "1h" }
);

    

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    const { password: pass, __v, updatedAt, createdAt, ...safeUser } = user._doc;

    res.status(200).json({
      user: safeUser,
      message: "login successfully",
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);

    await rediClient.set(`token:${token}`, "Blocked");
    await rediClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const { emailId } = req.user;

    const user = await User.findOne({ emailId }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const checkValidUser = async (req, res) => {
  const { __v, updatedAt, createdAt, ...safeUser } = req.user._doc;

  res.status(200).json({
    user: safeUser,
    message: "Valid User",
  });
};
