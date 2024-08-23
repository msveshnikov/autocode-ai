# Authentication Routes Documentation

## Overview

This file (`routes/auth.js`) handles authentication routes for the application. It provides functionality for user registration, login, and Google OAuth authentication. The router is part of an Express.js application and interacts with the User model to manage user data.

## Dependencies

-   express: Web application framework
-   bcrypt: Password hashing library
-   jsonwebtoken (jwt): JSON Web Token implementation
-   passport: Authentication middleware for Node.js
-   passport-google-oauth20: Google OAuth 2.0 authentication strategy for Passport
-   User model (from ../models/user.js): Mongoose model for user data

## Routes

### POST /register

Registers a new user in the system.

#### Parameters (request body)

-   username: String
-   email: String
-   password: String
-   tier: String

#### Returns

-   201 Status: JSON object containing a JWT token
-   400 Status: Error message if username or email already exists
-   500 Status: Error message if registration fails

#### Usage Example

```javascript
fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        tier: "Free",
    }),
})
    .then((response) => response.json())
    .then((data) => console.log(data.token));
```

### POST /login

Authenticates a user and provides a JWT token.

#### Parameters (request body)

-   username: String
-   password: String

#### Returns

-   200 Status: JSON object containing a JWT token
-   401 Status: Error message for invalid credentials
-   500 Status: Error message if login fails

#### Usage Example

```javascript
fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        username: "existinguser",
        password: "password123",
    }),
})
    .then((response) => response.json())
    .then((data) => console.log(data.token));
```

### GET /google

Initiates Google OAuth authentication.

#### Usage

Redirect the user to this route to start Google OAuth flow.

### GET /google/callback

Callback route for Google OAuth authentication.

#### Returns

Redirects to '/profile' with a JWT token as a query parameter upon successful authentication.

## Passport Google Strategy

The file configures Passport to use Google OAuth 2.0 strategy for authentication.

### Configuration

-   clientID: Obtained from Google Developer Console
-   clientSecret: Obtained from Google Developer Console
-   callbackURL: '/auth/google/callback'

### Functionality

1. Checks if a user with the given Google ID exists in the database
2. If not, creates a new user with information from the Google profile
3. Returns the user object to Passport

## Project Context

This file is crucial for the authentication system of the application. It works in conjunction with:

-   `models/user.js`: Defines the User schema and model
-   `middleware/auth.js`: Likely contains middleware for protecting routes
-   `views/login.ejs` and `views/register.ejs`: Frontend views for authentication
-   `routes/profile.js`: Handles user profile-related routes

The authentication system supports both local (username/password) and Google OAuth strategies, providing flexibility for user registration and login.

## Security Considerations

-   Passwords are hashed using bcrypt before storage
-   JWT tokens are used for maintaining user sessions
-   Google OAuth is implemented for secure third-party authentication

## Note

Ensure that environment variables (`JWT_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) are properly set for the application to function correctly.
