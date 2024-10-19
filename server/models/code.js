// models/code.js

import mongoose from "mongoose";
import crypto from "crypto";
import User from "./user.js";

const codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    isRedeemed: {
        type: Boolean,
        default: false,
    },
    redeemedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    redeemedAt: {
        type: Date,
    },
});

const Code = mongoose.model("Code", codeSchema);

export async function generateRedeemCodes(count = 1000) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(8).toString("hex").toUpperCase();
        codes.push({ code });
    }
    await Code.insertMany(codes);
}

export async function redeemCode(code, userId) {
    const redeemCode = await Code.findOne({ code, isRedeemed: false });
    if (!redeemCode) {
        throw new Error("Invalid or already redeemed code");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    redeemCode.isRedeemed = true;
    redeemCode.redeemedBy = user._id;
    redeemCode.redeemedAt = new Date();
    await redeemCode.save();

    user.tier = "Premium";
    user.tierExpiration = null;
    await user.save();

    return user;
}

export default Code;
