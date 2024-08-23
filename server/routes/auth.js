import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Inquiry from "../models/inquiry.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, tier = "Free" } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: "Username or email already exists" });
        }
        const user = new User({ username, email, password, tier });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, { expiresIn: "14d" });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, { expiresIn: "14d" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
});

router.post("/logout", authenticateJWT, (req, res) => {
    res.json({ message: "Logged out successfully" });
});

router.get("/check", authenticateJWT, (req, res) => {
    res.json({ message: "Token is valid", user: req.user });
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
