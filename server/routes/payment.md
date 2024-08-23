# Payment Routes Documentation

## Overview

This file (`routes/payment.js`) contains the Express router for handling payment-related operations in the application. It integrates with Stripe for processing payments, managing subscriptions, and retrieving pricing information. The router includes endpoints for creating checkout sessions, handling Stripe webhooks, canceling subscriptions, and fetching pricing details.

## Dependencies

-   express
-   stripe
-   ../models/user.js
-   ../middleware/auth.js

## Router Configuration

```javascript
import express from "express";
import Stripe from "stripe";
import User from "../models/user.js";
import { authCookie, checkUserTier } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

The router is configured with necessary imports and initializes a Stripe instance using the secret key from environment variables.

## Endpoints

### 1. Create Checkout Session

**Route:** `POST /create-checkout-session`

**Middleware:** `authCookie`

**Description:** Creates a Stripe checkout session for user subscription.

**Parameters:**

-   `req.body.tier`: The subscription tier (Premium or Enterprise)

**Returns:** JSON object with `sessionId`

**Usage Example:**

```javascript
const response = await fetch("/create-checkout-session", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer <JWT_TOKEN>",
    },
    body: JSON.stringify({ tier: "Premium" }),
});
const data = await response.json();
// Use data.sessionId to redirect to Stripe Checkout
```

### 2. Stripe Webhook Handler

**Route:** `POST /webhook`

**Description:** Handles Stripe webhook events, particularly for completed checkout sessions.

**Returns:** JSON object with `{ received: true }`

### 3. Cancel Subscription

**Route:** `POST /cancel-subscription`

**Middleware:** `authCookie`, `checkUserTier`

**Description:** Cancels the user's active subscription.

**Returns:** JSON object with success message

**Usage Example:**

```javascript
const response = await fetch("/cancel-subscription", {
    method: "POST",
    headers: {
        Authorization: "Bearer <JWT_TOKEN>",
    },
});
const data = await response.json();
```

### 4. Get Pricing Information

**Route:** `GET /pricing`

**Description:** Retrieves pricing information for all tiers.

**Returns:** JSON object with pricing details for Free, Premium, and Enterprise tiers

**Usage Example:**

```javascript
const response = await fetch("/pricing");
const pricingData = await response.json();
```

## Error Handling

Each route includes error handling to catch and respond to potential issues during execution. Errors are logged to the console and appropriate error responses are sent to the client.

## Project Context

This payment routes file is a crucial part of the application's subscription and payment system. It interacts with:

-   The User model (`../models/user.js`) for updating user subscription details.
-   Authentication middleware (`../middleware/auth.js`) to secure routes.
-   Environment variables for Stripe configuration.
-   Frontend views (in the `views` directory) for success and cancellation pages.

The routes defined here support the subscription-based features of the application, allowing users to upgrade their accounts, process payments, and manage their subscriptions.
