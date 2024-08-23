import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authCookie = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
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
    } catch (error) {
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

        user.resetDailyRequests();

        if (!user.canMakeRequest()) {
            return res.status(429).json({ error: "Daily request limit exceeded" });
        }

        user.incrementDailyRequests();
        await user.save();
        next();
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    authCookie,
    checkUserTier,
    requirePremium,
    requireEnterprise,
    checkRequestLimit,
    checkDeviceLimit,
};
