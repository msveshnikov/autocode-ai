import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { CONFIG } from "../config.js";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    tier: {
        type: String,
        enum: ["Free", "Premium", "Enterprise"],
        default: "Free",
    },
    stripeCustomerId: {
        type: String,
    },
    stripeSubscriptionId: {
        type: String,
    },
    lastRequestDate: {
        type: Date,
        default: Date.now,
    },
    dailyRequests: {
        type: Number,
        default: 0,
    },
    devices: {
        type: [String],
        default: [],
    },
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateTier = function (newTier) {
    this.tier = newTier;
};

UserSchema.methods.resetDailyRequests = function () {
    const today = new Date().setHours(0, 0, 0, 0);
    if (this.lastRequestDate.setHours(0, 0, 0, 0) < today) {
        this.lastRequestDate = new Date();
        this.dailyRequests = 0;
    }
};

UserSchema.methods.incrementDailyRequests = function () {
    this.dailyRequests += 1;
    this.lastRequestDate = new Date();
};

UserSchema.methods.addDevice = function (deviceId) {
    if (!this.devices.includes(deviceId)) {
        const tierConfig = CONFIG.pricingTiers[this.tier.toLowerCase()];
        if (tierConfig && this.devices.length < tierConfig.devices) {
            this.devices.push(deviceId);
        }
    }
};

UserSchema.methods.removeDevice = function (deviceId) {
    this.devices = this.devices.filter((id) => id !== deviceId);
};

const User = mongoose.model("User", UserSchema);

export default User;
