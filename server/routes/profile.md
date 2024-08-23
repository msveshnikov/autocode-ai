# Profile Router Documentation

## Overview

This file (`routes/profile.js`) defines the router for handling user profile-related operations in the application. It includes routes for viewing and updating user profiles, managing subscriptions, checking usage limits, and retrieving device information. The router uses Express.js and implements authentication using Passport.js with JWT strategy.

## Dependencies

-   express
-   passport
-   User model (from "../models/user.js")
-   Stripe

## Routes

### 1. Get User Profile

**Endpoint:** GET "/"

**Authentication:** Required (JWT)

**Description:** Retrieves the user's profile information and renders the profile page.

**Implementation:**

```javascript
router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
    // ... (implementation details)
});
```

**Response:**

-   Renders the "profile" view with user data (excluding password)
-   On error: 500 status with JSON error message

### 2. Update User Profile

**Endpoint:** PUT "/"

**Authentication:** Required (JWT)

**Description:** Updates the user's name and/or email in the database.

**Request Body:**

-   `name` (optional): New username
-   `email` (optional): New email address

**Implementation:**

```javascript
router.put("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
    // ... (implementation details)
});
```

**Response:**

-   Success: JSON object with success message
-   Error: 500 status with JSON error message

### 3. Get Subscription Information

**Endpoint:** GET "/subscription"

**Authentication:** Required (JWT)

**Description:** Retrieves the user's subscription tier and Stripe subscription details.

**Implementation:**

```javascript
router.get("/subscription", passport.authenticate("jwt", { session: false }), async (req, res) => {
    // ... (implementation details)
});
```

**Response:**

-   JSON object containing user's tier and Stripe subscription data
-   Error: 500 status with JSON error message

### 4. Get Usage Information

**Endpoint:** GET "/usage"

**Authentication:** Required (JWT)

**Description:** Retrieves the user's daily request usage, tier, and remaining requests.

**Implementation:**

```javascript
router.get("/usage", passport.authenticate("jwt", { session: false }), async (req, res) => {
    // ... (implementation details)
});
```

**Response:**

-   JSON object with daily requests, last request date, tier, request limit, and remaining requests
-   Error: 500 status with JSON error message

### 5. Get Device Information

**Endpoint:** GET "/devices"

**Authentication:** Required (JWT)

**Description:** Retrieves the user's registered devices, device limit, and remaining device slots.

**Implementation:**

```javascript
router.get("/devices", passport.authenticate("jwt", { session: false }), async (req, res) => {
    // ... (implementation details)
});
```

**Response:**

-   JSON object with devices array, device limit, and remaining devices
-   Error: 500 status with JSON error message

## Usage Example

To use this router in the main application:

```javascript
import express from "express";
import profileRouter from "./routes/profile.js";

const app = express();

// ... other middleware and configurations

app.use("/profile", profileRouter);

// ... other route configurations

app.listen(3000, () => console.log("Server running on port 3000"));
```

## Project Context

This profile router is part of a larger project that appears to be a license server or subscription-based service. It interacts with other components such as:

-   User model (`models/user.js`) for database operations
-   Authentication middleware (likely in `middleware/auth.js`)
-   Views for rendering pages (`views/profile.ejs`)
-   Localization files for internationalization (`locales/`)

The router handles crucial user-centric operations, integrating with Stripe for subscription management and implementing tiered access control for features like daily request limits and device management.
