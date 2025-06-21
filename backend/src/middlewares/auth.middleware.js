import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import rediClient from "../config/redis.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔥 req.cookies:", req.cookies); // check if token is received

    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ JWT Payload:", payload);

    const { _id } = payload;
    if (!_id) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const isBlocked = await rediClient.exists(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({ error: "Unauthorized: Token has been revoked" });
    }

    const user = await User.findById(_id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default authMiddleware;
