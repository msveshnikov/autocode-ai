import express from "express";
import Stripe from "stripe";
import User from "../models/user.js";
import { authCookie } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"];
    try {
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("✅ Success:", event.id);
        switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.created":
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                await handleSubscriptionUpdate(subscription);
                break;
            }
            case "checkout.session.completed": {
                const checkoutSessionCompleted = event.data.object;
                await handleCheckout(checkoutSessionCompleted);
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.send();
    } catch (err) {
        console.error(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

async function handleSubscriptionUpdate(subscription) {
    console.log(subscription);
    const customer = await stripe.customers.retrieve(subscription.customer);
    let user = await User.findOne({ email: customer.email });
    if (!user) {
        console.log("User not found, skipping " + customer.email);
        return;
    }
    user.subscriptionStatus = subscription.status;
    user.stripeSubscriptionId = subscription.id;
    user.stripeCustomerId = customer.id;
    if (subscription.status === "active" || subscription.status === "trialing") {
        user.tier = "Premium";
    } else {
        user.tier = "Free";
    }
    await user.save();
}

export const handleCheckout = async (session) => {
    console.log("handleCheckout started", session);
    try {
        const user = await User.findOne({ email: session.customer_details.email });
        if (!user || session.amount_total !== 3000) {
            console.error("handleCheckout failed, not AutoCode user");
            return;
        }
        user.tier = "LTD";
        await user.save();
        console.log("handleCheckout succesfull", user);
    } catch (e) {
        console.error(e);
    }
};

router.post("/cancel-subscription", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.stripeSubscriptionId) {
            return res.status(400).json({ error: "No active subscription found" });
        }
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        user.tier = "Free";
        user.stripeSubscriptionId = null;
        user.subscriptionStatus = "canceled";
        await user.save();
        res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ error: "Failed to cancel subscription" });
    }
});

export default router;
