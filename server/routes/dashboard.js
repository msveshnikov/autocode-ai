import express from "express";
import { authCookie, isAdmin } from "../middleware/auth.js";
import User from "../models/user.js";
import { CONFIG } from "../config.js";

const router = express.Router();

router.get("/", authCookie, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).lean();
        const userStats = users.map((user) => {
            const tierConfig = CONFIG.pricingTiers[user.tier.toLowerCase()];
            const usagePercentage = (user.dailyRequests / 100) * 100;
            return {
                _id: user._id,
                email: user.email,
                tier: user.tier,
                dailyRequests: user.dailyRequests,
                usagePercentage,
                remainingRequests: Math.max(0, 100 - user.dailyRequests),
                devices: user.devices.length,
                lastRequestDate: user.lastRequestDate,
            };
        });

        const stats = {
            totalUsers: users.length,
            usersByTier: {
                free: users.filter((u) => u.tier === "Free").length,
                premium: users.filter((u) => u.tier === "Premium").length,
                enterprise: users.filter((u) => u.tier === "Enterprise").length,
            },
            totalDailyRequests: users.reduce((sum, user) => sum + user.dailyRequests, 0),
            averageRequestsPerUser: users.length
                ? users.reduce((sum, user) => sum + user.dailyRequests, 0) / users.length
                : 0,
        };

        res.render("dashboard", {
            userStats,
            stats,
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("500");
    }
});

router.get("/user/:userId", authCookie, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).lean();
        if (!user) {
            return res.status(404).render("404");
        }
        const tierConfig = CONFIG.pricingTiers[user.tier.toLowerCase()];
        const userDetails = {
            ...user,
            usagePercentage: (user.dailyRequests / tierConfig.dailyRequests) * 100,
            remainingRequests: Math.max(0, tierConfig.dailyRequests - user.dailyRequests),
        };
        res.render("userDetails", { user: userDetails });
    } catch (error) {
        console.error(error);
        res.status(500).render("500");
    }
});

router.delete("/user/:userId", authCookie, isAdmin, async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.userId);
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while deleting the user" });
    }
});

export default router;
