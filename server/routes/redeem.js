import express from "express";
import Code from "../models/code.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("redeem", { user: req.cookies.token });
});

router.post("/", async (req, res) => {
    try {
        const { code, email } = req.body;

        const redeemCode = await Code.findOne({ code });
        if (!redeemCode) {
            return res.status(400).json({ message: "Invalid redeem code" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        user.tier = "Premium";
        await user.save();

        await Code.deleteOne({ _id: redeemCode._id });

        res.status(200).json({ message: "Code redeemed successfully" });
    } catch (error) {
        console.error("Error redeeming code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
