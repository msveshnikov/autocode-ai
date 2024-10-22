# Payment Routes Documentation

## Overview

This file (`server/routes/payment.js`) handles payment-related routes and webhook handlers for Stripe integration in the application. It manages subscription updates, checkout sessions, and subscription cancellations for users.

## Dependencies

-   `express`: Web framework for routing
-   `stripe`: Stripe API client
-   `User`: MongoDB user model
-   `authCookie`: Authentication middleware
-   `dotenv`: Environment variable management

## Routes and Handlers

### 1. Stripe Webhook Handler

```javascript
POST / webhook;
```

Handles incoming webhook events from Stripe.

**Configuration:**

-   Uses `express.raw()` middleware to receive raw request body
-   Validates webhook signature using `stripe-signature` header

**Supported Event Types:**

-   `customer.subscription.updated`
-   `customer.subscription.created`
-   `customer.subscription.deleted`
-   `checkout.session.completed`

**Response:**

-   200: Success
-   400: Webhook Error

### 2. Cancel Subscription

```javascript
POST / cancel - subscription;
```

Cancels a user's active subscription.

**Authentication:**

-   Requires valid authentication cookie (`authCookie` middleware)

**Response:**

-   200: `{ message: "Subscription cancelled successfully" }`
-   400: `{ error: "No active subscription found" }`
-   500: `{ error: "Failed to cancel subscription" }`

## Helper Functions

### `handleSubscriptionUpdate(subscription)`

Updates user subscription status in the database based on Stripe subscription events.

**Parameters:**

-   `subscription` (Object): Stripe subscription object

**Actions:**

-   Retrieves customer information from Stripe
-   Updates user's subscription status, IDs, and tier
-   Sets tier to "Premium" for active subscriptions, "Free" otherwise

### `handleCheckout(session)`

Processes completed checkout sessions.

**Parameters:**

-   `session` (Object): Stripe checkout session object

**Actions:**

-   Verifies user and payment amount
-   Updates user tier to "LTD" for successful payments
-   Logs checkout process status

## Integration with Project Structure

This file is part of the server's payment processing system and works in conjunction with:

-   `/server/models/user.js`: User model for database operations
-   `/server/middleware/auth.js`: Authentication middleware
-   Frontend payment integration in dashboard views

## Environment Variables Required

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Usage Examples

### Setting Up Webhook Handler

```javascript
// Stripe CLI testing
stripe listen --forward-to localhost:3000/payment/webhook
```

### Canceling a Subscription

```javascript
// Frontend API call
await fetch("/payment/cancel-subscription", {
    method: "POST",
    credentials: "include",
});
```

## Error Handling

-   Webhook signature verification
-   User existence validation
-   Subscription status verification
-   Database operation error handling
-   Payment amount validation

## Security Considerations

-   Uses Stripe signature verification
-   Requires authentication for sensitive operations
-   Validates user permissions and subscription status
-   Handles sensitive payment data securely

This documentation provides a comprehensive overview of the payment routes and their functionality within the application. For specific implementation details, refer to the inline comments in the code.
