import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Inquiry from "../models/inquiry.js";
import { authCookie } from "../middleware/auth.js";
import {
    getIpFromRequest,
    validateEmail,
    sanitizeInput,
    generatePasswordResetToken,
    sendPasswordResetEmail,
    sendWelcomeEmail,
} from "../utils.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password, tier = "Free" } = req.body;
        if (!validateEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
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
        await sendWelcomeEmail(user.email);
        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
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
        console.error(error);
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
        const sanitizedMessage = sanitizeInput(message);
        const inquiry = new Inquiry({ name, email, subject, message: sanitizedMessage });
        await inquiry.save();
        res.status(201).json({ message: "Inquiry submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error submitting inquiry" });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const resetToken = generatePasswordResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `https://autocode.work/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);
        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending password reset email" });
    }
});

router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired" });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password has been reset" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error resetting password" });
    }
});

export default router;
