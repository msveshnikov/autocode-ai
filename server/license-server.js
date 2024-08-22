import express from "express";
import { json } from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Stripe from "stripe";

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.JWT_SECRET || "your-secret-key";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    tier: String,
    stripeCustomerId: String,
});

const LicenseSchema = new mongoose.Schema({
    userId: String,
    requestsToday: Number,
    lastReset: Date,
});

const User = mongoose.model("User", UserSchema);
const License = mongoose.model("License", LicenseSchema);

app.use(json());

app.post("/register", async (req, res) => {
    const { username, password, tier } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        id: uuidv4(),
        username,
        password: hashedPassword,
        tier,
    });
    await user.save();
    const token = jwt.sign({ id: user.id, username: user.username, tier: user.tier }, secretKey);
    res.json({ token });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, tier: user.tier }, secretKey);
    res.json({ token });
});

app.post("/check", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        const { id, tier } = decoded;
        let license = await License.findOne({ userId: id });
        if (!license) {
            license = new License({ userId: id, requestsToday: 0, lastReset: new Date() });
        }
        const today = new Date();
        if (today.getDate() !== license.lastReset.getDate()) {
            license.requestsToday = 0;
            license.lastReset = today;
        }
        const maxRequests = tier === "Premium" ? Infinity : tier === "Free" ? 10 : Infinity;
        if (license.requestsToday >= maxRequests) {
            return res.status(403).json({ error: "Daily limit exceeded" });
        }
        license.requestsToday++;
        await license.save();
        res.json({ valid: true, tier, requestsToday: license.requestsToday });
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.post("/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const user = await User.findOne({ id: userId });
        if (user) {
            user.tier = "Premium";
            user.stripeCustomerId = session.customer;
            await user.save();
        }
    }

    res.json({ received: true });
});

app.listen(port, () => {
    console.log(`License server running on port ${port}`);
});

export default app;
