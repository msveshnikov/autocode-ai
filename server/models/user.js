import mongoose from "mongoose";
import bcrypt from "bcrypt";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
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
    googleId: {
        type: String,
    },
    lastRequestDate: {
        type: String,
    },
    dailyRequests: {
        type: Number,
        default: 0,
    },
    devices: {
        type: Number,
        default: 3,
    },
    name: {
        type: String,
        trim: true,
    },
    language: {
        type: String,
        default: "en",
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
    if (newTier === "Premium") {
        this.devices = 10;
    } else if (newTier === "Enterprise") {
        this.devices = Infinity;
    }
};

UserSchema.methods.resetDailyRequests = function () {
    const today = new Date().toISOString().split("T")[0];
    if (this.lastRequestDate !== today) {
        this.lastRequestDate = today;
        this.dailyRequests = 0;
    }
};

UserSchema.methods.incrementDailyRequests = function () {
    this.dailyRequests += 1;
};

UserSchema.methods.canMakeRequest = function () {
    return this.tier !== "Free" || this.dailyRequests < 10;
};

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

export default User;
