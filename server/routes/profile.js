import express from "express";
import passport from "passport";
import User from "../models/user.js";
import Stripe from "stripe";

const router = express.Router();

router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.render("profile", { user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);

        if (name) user.username = name;
        if (email) user.email = email;

        await user.save();

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/subscription", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("tier stripeCustomerId");
        let subscription = null;

        if (user.stripeCustomerId) {
            const subscriptions = await Stripe.subscriptions.list({
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

router.get("/usage", passport.authenticate("jwt", { session: false }), async (req, res) => {
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

router.get("/devices", passport.authenticate("jwt", { session: false }), async (req, res) => {
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

export default router;
