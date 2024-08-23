import express from "express";
import User from "../models/user.js";
import Stripe from "stripe";
import { authenticateJWT, checkUserTier, checkRequestLimit } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.render("profile", { user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/", authenticateJWT, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, email } },
            { new: true, runValidators: true }
        );
        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/subscription", authenticateJWT, async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/subscription/cancel", authenticateJWT, async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/usage", authenticateJWT, checkUserTier, checkRequestLimit, async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/devices", authenticateJWT, async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/devices", authenticateJWT, async (req, res) => {
    try {
        const { deviceId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.devices.includes(deviceId)) {
            user.devices.push(deviceId);
            await user.save();
        }

        res.json({ success: true, message: "Device added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/devices/:deviceId", authenticateJWT, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const user = await User.findById(req.user.id);

        user.devices = user.devices.filter((device) => device !== deviceId);
        await user.save();

        res.json({ success: true, message: "Device removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
