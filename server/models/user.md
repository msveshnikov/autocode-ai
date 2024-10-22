# User Model Documentation

## Overview

This file (`models/user.js`) defines the User model for the application using Mongoose, an Object Data Modeling (ODM) library for MongoDB and Node.js. It sets up the schema for user data, including authentication information, subscription tiers, and usage tracking. The model also includes methods for password hashing, comparison, and managing user tiers and request limits.

## Schema Definition

The `UserSchema` defines the structure of user documents in the database:

- `username`: String (required, unique, trimmed)
- `email`: String (required, unique, trimmed, lowercase)
- `password`: String (required, hashed before saving)
- `tier`: String (enum: ["Free", "Premium", "Enterprise","LTD"], default: "Free")
- `stripeCustomerId`: String (optional, for payment integration)
- `googleId`: String (optional, for Google OAuth)
- `lastRequestDate`: String (tracks the date of last request)
- `dailyRequests`: Number (default: 0, tracks daily API usage)
- `devices`: Number (default: 3, number of allowed devices)
- `name`: String (optional, trimmed)

## Methods

### Pre-save Hook

```javascript
UserSchema.pre("save", async function (next) { ... }
```

This middleware function runs before saving a user document. It hashes the password if it has been modified.

### comparePassword

```javascript
UserSchema.methods.comparePassword = async function (candidatePassword) { ... }
```

Compares a given password with the stored hashed password.

- **Parameters:** `candidatePassword` (String)
- **Returns:** Promise<boolean>

### updateTier

```javascript
UserSchema.methods.updateTier = function (newTier) { ... }
```

Updates the user's subscription tier and adjusts the number of allowed devices accordingly.

- **Parameters:** `newTier` (String: "Free", "Premium", or "Enterprise")

### resetDailyRequests

```javascript
UserSchema.methods.resetDailyRequests = function () { ... }
```

Resets the daily request count if it's a new day.

### incrementDailyRequests

```javascript
UserSchema.methods.incrementDailyRequests = function () { ... }
```

Increments the daily request count by 1.

### canMakeRequest

```javascript
UserSchema.methods.canMakeRequest = function () { ... }
```

Checks if the user can make a request based on their tier and daily request count.

- **Returns:** boolean

## Usage Examples

```javascript
// Creating a new user
const newUser = new User({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'securepassword'
});
await newUser.save();

// Comparing passwords
const isMatch = await user.comparePassword('inputPassword');

// Updating user tier
user.updateTier('Premium');
await user.save();

// Checking if user can make a request
if (user.canMakeRequest()) {
  // Process the request
  user.incrementDailyRequests();
  await user.save();
} else {
  // Handle limit exceeded
}
```

## Role in Project Structure

This model is a crucial part of the application's data layer. It's used by:

- `routes/auth.js` for user authentication and registration
- `routes/payment.js` for handling subscription changes
- `routes/profile.js` for user profile management
- `middleware/auth.js` for authentication checks

The User model interacts with the MongoDB database and provides a structured way to manage user data throughout the application.