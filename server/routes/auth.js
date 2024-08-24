import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Inquiry from "../models/inquiry.js";
import { authCookie } from "../middleware/auth.js";
import { getIpFromRequest } from "../utils.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password, tier = "Free" } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const user = new User({ email, password, tier });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, { expiresIn: "14d" });
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 14 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: "strict",
        });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, { expiresIn: "14d" });
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 14 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: "strict",
        });
        const ip = getIpFromRequest(req);
        user.addDevice(ip);
        await user.save();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
});

router.post("/logout", authCookie, (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

router.post("/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const inquiry = new Inquiry({ name, email, subject, message });
        await inquiry.save();
        res.status(201).json({ message: "Inquiry submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error submitting inquiry" });
    }
});

export default router;
