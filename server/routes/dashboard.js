import express from "express";
import { authCookie, isAdmin } from "../middleware/auth.js";
import User from "../models/user.js";
import { CONFIG } from "../config.js";

const router = express.Router();

router.get("/", authCookie, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).render("404");
        }

        const tierConfig = CONFIG.pricingTiers[user.tier.toLowerCase()];
        const usagePercentage = (user.dailyRequests / tierConfig.dailyRequests) * 100;

        res.render("dashboard", {
            user,
            tierConfig,
            usagePercentage,
            remainingRequests: Math.max(0, tierConfig.dailyRequests - user.dailyRequests),
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("500");
    }
});

router.get("/usage", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const tierConfig = CONFIG.pricingTiers[user.tier.toLowerCase()];
        const usagePercentage = (user.dailyRequests / tierConfig.dailyRequests) * 100;

        res.json({
            dailyRequests: user.dailyRequests,
            dailyLimit: tierConfig.dailyRequests,
            usagePercentage,
            remainingRequests: Math.max(0, tierConfig.dailyRequests - user.dailyRequests),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/devices", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const tierConfig = CONFIG.pricingTiers[user.tier.toLowerCase()];

        res.json({
            devices: user.devices,
            deviceLimit: tierConfig.devices,
            remainingDevices: Math.max(0, tierConfig.devices - user.devices.length),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/remove-device", authCookie, async (req, res) => {
    try {
        const { deviceId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.removeDevice(deviceId);
        await user.save();

        res.json({ message: "Device removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
