import express from "express";
import Stripe from "stripe";
import User from "../models/user.js";
import { authenticateJWT, checkUserTier } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { tier } = req.body;

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
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.tier = session.amount_total === 1000 ? "Premium" : "Enterprise";
        user.stripeSubscriptionId = subscriptionId;
        await user.save();
      }
    } catch (error) {
      console.error("Error updating user after successful payment:", error);
    }
  }

  res.json({ received: true });
});

router.post("/cancel-subscription", authenticateJWT, checkUserTier, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found" });
    }

    await stripe.subscriptions.del(user.stripeSubscriptionId);

    user.tier = "Free";
    user.stripeSubscriptionId = null;
    await user.save();

    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

router.get("/pricing", async (req, res) => {
  try {
    const premiumPrice = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID);
    const enterprisePrice = await stripe.prices.retrieve(process.env.STRIPE_ENTERPRISE_PRICE_ID);

    const pricing = {
      free: {
        name: "Free",
        price: 0,
        features: ["10 requests/day", "Basic features", "3 devices", "Community support"],
      },
      premium: {
        name: "Premium",
        price: premiumPrice.unit_amount / 100,
        features: ["Unlimited requests", "All features", "10 devices", "Priority support"],
      },
      enterprise: {
        name: "Enterprise",
        price: "Custom",
        features: [
          "Unlimited requests",
          "All features + custom integrations",
          "Unlimited devices",
          "Dedicated support team",
          "On-premises deployment option",
        ],
      },
    };

    res.json(pricing);
  } catch (error) {
    console.error("Error fetching pricing information:", error);
    res.status(500).json({ error: "Failed to fetch pricing information" });
  }
});

export default router;