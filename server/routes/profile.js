import express from "express";
import User from "../models/user.js";
import { authCookie } from "../middleware/auth.js";
import { CONFIG } from "../config.js";

const router = express.Router();

router.get("/", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.render("profile", { user });
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/subscription", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("tier subscriptionStatus");
        res.json({ tier: user.tier, subscriptionStatus: user.subscriptionStatus });
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/usage", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("dailyRequests lastRequestDate tier");
        const requestLimit = CONFIG.pricingTiers[user.tier.toLowerCase()].requestsPerDay;
        const remainingRequests = Math.max(0, requestLimit - user.dailyRequests);

        res.json({
            dailyRequests: user.dailyRequests,
            lastRequestDate: user.lastRequestDate,
            tier: user.tier,
            subscriptionStatus: user.subscriptionStatus,
            requestLimit,
            remainingRequests,
        });
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/devices", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("devices tier");
        const deviceLimit = CONFIG.pricingTiers[user.tier.toLowerCase()].devices;

        res.json({
            devices: user.devices,
            deviceLimit,
        });
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
