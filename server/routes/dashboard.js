import express from "express";
import { authCookie, isAdmin } from "../middleware/auth.js";
import User from "../models/user.js";
import Inquiry from "../models/inquiry.js";
import { CONFIG } from "../config.js";

const router = express.Router();

router.get("/", authCookie, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).lean();
        const inquiries = await Inquiry.find({}).sort({ createdAt: -1 }).limit(10).lean();
        const userStats = users.map((user) => {
            const tierConfig = CONFIG.pricingTiers[user.tier.toLowerCase()];
            const usagePercentage = (user.dailyRequests / tierConfig.requestsPerDay) * 100;
            return {
                _id: user._id,
                email: user.email,
                tier: user.tier,
                dailyRequests: user.dailyRequests,
                usagePercentage,
                remainingRequests: Math.max(0, tierConfig.requestsPerDay - user.dailyRequests),
                devices: user.devices.length,
                lastRequestDate: user.lastRequestDate,
            };
        });

        const stats = {
            totalUsers: users.length,
            usersByTier: {
                free: users.filter((u) => u.tier === "Free").length,
                premium: users.filter((u) => u.tier === "Premium").length,
                ltd: users.filter((u) => u.tier === "LTD").length,
                enterprise: users.filter((u) => u.tier === "Enterprise").length,
            },
            totalDailyRequests: users.reduce((sum, user) => sum + user.dailyRequests, 0),
            averageRequestsPerUser: users.length
                ? users.reduce((sum, user) => sum + user.dailyRequests, 0) / users.length
                : 0,
            totalInquiries: await Inquiry.countDocuments(),
            pendingInquiries: await Inquiry.countDocuments({ status: "pending" }),
        };

        res.render("dashboard", {
            userStats,
            stats,
            inquiries,
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

router.get("/inquiries", authCookie, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const inquiries = await Inquiry.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

        const totalInquiries = await Inquiry.countDocuments();
        const totalPages = Math.ceil(totalInquiries / limit);

        res.render("inquiries", {
            inquiries,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("500");
    }
});

router.put("/inquiry/:inquiryId", authCookie, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const inquiry = await Inquiry.findByIdAndUpdate(req.params.inquiryId, { status }, { new: true });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json(inquiry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating the inquiry" });
    }
});

export default router;
