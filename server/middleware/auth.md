# Authentication Middleware (auth.js)

## Overview

This file contains middleware functions for authentication, user tier verification, and request/device limit checking. It's part of the middleware layer in the project structure, specifically handling authentication and authorization concerns.

## Functions

### authCookie(req, res, next)

Authenticates requests using JSON Web Tokens (JWT).

#### Parameters:
- `req`: Express request object
- `res`: Express response object
- `next`: Express next function

#### Description:
- Extracts the JWT from the Authorization header
- Verifies the token using the `JWT_TOKEN` environment variable
- If valid, adds the decoded user information to the request object
- Calls `next()` if authentication is successful, otherwise sends appropriate HTTP status codes

#### Usage:
```javascript
app.use(authCookie);
```

### checkUserTier(req, res, next)

Retrieves and adds the user's subscription tier to the request object.

#### Parameters:
- `req`: Express request object
- `res`: Express response object
- `next`: Express next function

#### Description:
- Finds the user in the database using the ID from the authenticated request
- Adds the user's tier to the request object as `req.userTier`
- Calls `next()` if successful, otherwise sends error responses

#### Usage:
```javascript
app.use(checkUserTier);
```

### requirePremium(req, res, next)

Ensures the user has a Premium or Enterprise subscription.

#### Parameters:
- `req`: Express request object
- `res`: Express response object
- `next`: Express next function

#### Description:
- Checks if `req.userTier` is "Premium" or "Enterprise"
- Calls `next()` if the condition is met, otherwise sends a 403 error

#### Usage:
```javascript
app.use(requirePremium);
```

### requireEnterprise(req, res, next)

Ensures the user has an Enterprise subscription.

#### Parameters:
- `req`: Express request object
- `res`: Express response object
- `next`: Express next function

#### Description:
- Checks if `req.userTier` is "Enterprise"
- Calls `next()` if the condition is met, otherwise sends a 403 error

#### Usage:
```javascript
app.use(requireEnterprise);
```

### checkRequestLimit(req, res, next)

Enforces daily request limits for free tier users.

#### Parameters:
- `req`: Express request object
- `res`: Express response object
- `next`: Express next function

#### Description:
- Retrieves the user from the database
- Checks and updates the daily request count
- Limits free tier users to 10 requests per day
- Calls `next()` if the limit is not exceeded, otherwise sends a 429 error

#### Usage:
```javascript
app.use(checkRequestLimit);
```

### checkDeviceLimit(req, res, next)

Enforces device limits based on the user's subscription tier.

#### Parameters:
- `req`: Express request object
- `res`: Express response object
- `next`: Express next function

#### Description:
- Retrieves the user from the database
- Determines the device limit based on the user's tier (Free: 3, Premium: 10, Enterprise: Infinite)
- Checks if adding a new device would exceed the limit
- Calls `next()` if the limit is not exceeded, otherwise sends a 403 error

#### Usage:
```javascript
app.use(checkDeviceLimit);
```

## Export

The file exports all middleware functions individually and as a default object, allowing for flexible import options in other parts of the application.

## Project Context

This middleware file plays a crucial role in the application's authentication and authorization flow. It works in conjunction with the User model (`../models/user.js`) and is likely used in various route files to protect endpoints and enforce subscription-based access controls.