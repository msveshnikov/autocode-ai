import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export const checkUserTier = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.userTier = user.tier;
        next();
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const requirePremium = (req, res, next) => {
    if (req.userTier === "Premium" || req.userTier === "Enterprise") {
        next();
    } else {
        res.status(403).json({ error: "Premium or Enterprise subscription required" });
    }
};

export const requireEnterprise = (req, res, next) => {
    if (req.userTier === "Enterprise") {
        next();
    } else {
        res.status(403).json({ error: "Enterprise subscription required" });
    }
};

export const checkRequestLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const today = new Date().toISOString().split("T")[0];
        if (user.lastRequestDate !== today) {
            user.lastRequestDate = today;
            user.dailyRequests = 0;
        }

        if (user.tier === "Free" && user.dailyRequests >= 10) {
            return res.status(429).json({ error: "Daily request limit exceeded" });
        }

        user.dailyRequests += 1;
        await user.save();
        next();
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const checkDeviceLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const deviceLimit = user.tier === "Free" ? 3 : user.tier === "Premium" ? 10 : Infinity;

        if (user.devices.length >= deviceLimit) {
            return res.status(403).json({ error: "Device limit reached" });
        }

        next();
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    authenticateJWT,
    checkUserTier,
    requirePremium,
    requireEnterprise,
    checkRequestLimit,
    checkDeviceLimit,
};
