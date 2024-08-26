import express from "express";
import Stripe from "stripe";
import User from "../models/user.js";
import { authCookie } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/create-checkout-session", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { tier } = req.params;
        let priceId;
        if (tier === "Premium") {
            priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
        } else if (tier === "Enterprise") {
            priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
        } else {
            return res.status(400).json({ error: "Invalid tier selected" });
        }

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            client_reference_id: user.id,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.BASE_URL}/success`,
            cancel_url: `${process.env.BASE_URL}/cancel`,
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

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
    user.subscriptionStatus = subscription.status;
    user.stripeSubscriptionId = subscription.id;
    user.stripeCustomerId = customer.id;
    if (subscription.status === "active") {
        user.tier = "Premium";
    } else {
        user.tier = "Free";
    }
    await user.save();
}

router.post("/cancel-subscription", authCookie, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.stripeSubscriptionId) {
            return res.status(400).json({ error: "No active subscription found" });
        }
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        user.tier = "Free";
        user.stripeSubscriptionId = null;
        await user.save();
        res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ error: "Failed to cancel subscription" });
    }
});

export default router;
