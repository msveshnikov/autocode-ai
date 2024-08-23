import express from "express";
import User from "../models/user.js";
import Stripe from "stripe";
import { authCookie, checkUserTier, checkRequestLimit, checkDeviceLimit } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.render("profile", { user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/", authCookie, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, email } },
            { new: true, runValidators: true }
        ).select("-password");
        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/subscription", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("tier stripeCustomerId");
        let subscription = null;

        if (user.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 1,
            });
            subscription = subscriptions.data[0];
        }

        res.json({ tier: user.tier, subscription });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/subscription/cancel", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.stripeSubscriptionId) {
            await stripe.subscriptions.del(user.stripeSubscriptionId);
            user.tier = "Free";
            user.stripeSubscriptionId = null;
            await user.save();
            res.json({ success: true, message: "Subscription cancelled successfully" });
        } else {
            res.status(400).json({ error: "No active subscription found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/usage", authCookie, checkUserTier, checkRequestLimit, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("dailyRequests lastRequestDate tier");
        const requestLimit = user.tier === "Free" ? 10 : Infinity;
        const remainingRequests = Math.max(0, requestLimit - user.dailyRequests);

        res.json({
            dailyRequests: user.dailyRequests,
            lastRequestDate: user.lastRequestDate,
            tier: user.tier,
            requestLimit,
            remainingRequests,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/devices", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("devices tier");
        const deviceLimit = user.tier === "Free" ? 3 : user.tier === "Premium" ? 10 : Infinity;
        const remainingDevices = Math.max(0, deviceLimit - user.devices.length);

        res.json({
            devices: user.devices,
            deviceLimit,
            remainingDevices,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/devices", authCookie, checkDeviceLimit, async (req, res) => {
    try {
        const { deviceId } = req.body;
        const user = await User.findById(req.user.id);
        user.addDevice(deviceId);
        await user.save();
        res.json({ success: true, message: "Device added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/devices/:deviceId", authCookie, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const user = await User.findById(req.user.id);
        user.removeDevice(deviceId);
        await user.save();
        res.json({ success: true, message: "Device removed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
