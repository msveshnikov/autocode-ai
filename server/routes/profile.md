# Profile Routes Documentation

## Overview

This file (`routes/profile.js`) defines the routes related to user profiles in the application. It handles various profile-related operations such as viewing and updating profiles, managing subscriptions, tracking usage, and managing devices. The routes utilize Express.js for handling HTTP requests and interact with the User model and Stripe API for payment-related functionalities.

## Dependencies

- express
- User model (from `../models/user.js`)
- Stripe
- Authentication middleware (from `../middleware/auth.js`)

## Routes

### GET /

Retrieves and displays the user's profile.

**Middleware:** `authCookie`

**Response:**
- Renders the "profile" view with user data (excluding password)

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

### PUT /

Updates the user's profile information.

**Middleware:** `authCookie`

**Request Body:**
- `name`: User's new name
- `email`: User's new email

**Response:**
- JSON object with success message and updated user data

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

### GET /subscription

Retrieves the user's subscription information.

**Middleware:** `authCookie`

**Response:**
- JSON object containing user's tier and active Stripe subscription (if any)

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

### POST /subscription/cancel

Cancels the user's active subscription.

**Middleware:** `authCookie`

**Response:**
- JSON object with success message if subscription is cancelled

**Error Handling:**
- Returns a 400 status if no active subscription is found
- Returns a 500 status with a "Server error" message on other failures

### GET /usage

Retrieves the user's API usage information.

**Middleware:** `authCookie`, `checkUserTier`, `checkRequestLimit`

**Response:**
- JSON object containing daily requests, last request date, tier, request limit, and remaining requests

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

### GET /devices

Retrieves the user's registered devices.

**Middleware:** `authCookie`

**Response:**
- JSON object containing devices, device limit, and remaining devices

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

### POST /devices

Adds a new device to the user's account.

**Middleware:** `authCookie`

**Request Body:**
- `deviceId`: ID of the device to add

**Response:**
- JSON object with success message

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

### DELETE /devices/:deviceId

Removes a device from the user's account.

**Middleware:** `authCookie`

**Parameters:**
- `deviceId`: ID of the device to remove

**Response:**
- JSON object with success message

**Error Handling:**
- Returns a 500 status with a "Server error" message on failure

## Usage Examples

```javascript
// Get user profile
GET /profile

// Update user profile
PUT /profile
Body: { "name": "John Doe", "email": "john@example.com" }

// Get subscription info
GET /profile/subscription

// Cancel subscription
POST /profile/subscription/cancel

// Get usage info
GET /profile/usage

// Get devices
GET /profile/devices

// Add a device
POST /profile/devices
Body: { "deviceId": "device123" }

// Remove a device
DELETE /profile/devices/device123
```

## Project Context

This file is part of the `routes` directory in the project structure. It specifically handles profile-related routes and integrates with other components such as the User model, authentication middleware, and Stripe for payments. The routes defined here are likely to be used by the front-end views (e.g., `profile.ejs`) to display and manage user profile information.