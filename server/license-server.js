import express from "express";
import jwt from "jsonwebtoken";
import { User } from "./models/user.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const checkRequestLimit = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return false;

    const today = new Date().toISOString().split("T")[0];
    if (user.lastRequestDate !== today) {
        user.lastRequestDate = today;
        user.dailyRequests = 0;
    }

    if (user.tier === "Free" && user.dailyRequests >= 10) {
        return false;
    }

    user.dailyRequests += 1;
    await user.save();
    return true;
};

router.post("/check", authenticateToken, async (req, res) => {
    try {
        const allowed = await checkRequestLimit(req.user.id);
        if (!allowed) {
            return res.status(429).json({ error: "Daily request limit exceeded" });
        }
        res.json({ message: "Request allowed" });
    } catch  {
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/user", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch  {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
