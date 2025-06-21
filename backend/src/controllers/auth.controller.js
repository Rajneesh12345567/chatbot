import redisClient from "../config/redis.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validateUserInput from "../utils/validator.js";

// ✅ Helper: Create JWT Token
const createToken = (user) => {
  return jwt.sign(
    { _id: user._id, emailId: user.emailId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// ✅ Register Controller
export const register = async (req, res) => {
  try {
    validateUserInput(req.body);

    const { emailId, password } = req.body;
    const existingUser = await User.exists({ emailId });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashPassword });

    const token = createToken(user);

    

    const { password: _, __v, updatedAt, createdAt, ...safeUser } = user._doc;

    res.status(201).json({ user: safeUser, message: "Registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Login Controller
export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    const { password: _, __v, updatedAt, createdAt, ...safeUser } = user._doc;

    res.status(200).json({ user: safeUser, message: "Login successful" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// ✅ Logout Controller
export const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(400).json({ error: "Token not found in cookies" });
    }

    const payload = jwt.decode(token);
    if (!payload) {
      return res.status(400).json({ error: "Invalid token" });
    }

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(0),
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Profile Route (Requires Middleware)
export const profile = async (req, res) => {
  try {
    const { emailId } = req.user;
    const user = await User.findOne({ emailId }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Valid User Check (Middleware will attach req.user)
export const checkValidUser = async (req, res) => {
  const { __v, updatedAt, createdAt, ...safeUser } = req.user._doc;
  res.status(200).json({ user: safeUser, message: "Valid User" });
};
