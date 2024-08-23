# index.js Documentation

## Overview

This file serves as the main entry point for a web application built with Express.js. It sets up the server, configures middleware, initializes authentication strategies, and defines the main routes. The application integrates various features including internationalization, payment processing with Stripe, and user authentication using Google OAuth and JWT.

## Dependencies

- express: Web application framework
- mongoose: MongoDB object modeling tool
- Stripe: Payment processing library
- passport: Authentication middleware for Node.js
- i18n: Internationalization library
- dotenv: Environment variable management
- Other utility libraries (path, url, cookie-parser, express-session)

## Configuration

### Environment Variables

The application uses the following environment variables:

- PORT: Server port (default: 3000)
- MONGODB_URI: MongoDB connection string
- STRIPE_SECRET_KEY: Stripe API secret key
- JWT_TOKEN: Secret for JWT authentication
- GOOGLE_CLIENT_ID: Google OAuth client ID
- GOOGLE_CLIENT_SECRET: Google OAuth client secret
- SESSION_SECRET: Secret for express-session
- STRIPE_WEBHOOK_SECRET: Secret for Stripe webhooks

### Internationalization

The app supports multiple languages (English, Spanish, French) using the i18n library.

### Database

MongoDB is used as the database, connected via mongoose.

### Authentication

Two authentication strategies are implemented:
1. JWT (JSON Web Token) for API authentication
2. Google OAuth for user login

## Main Components

### Express Application Setup

```javascript
const app = express();
const port = process.env.PORT || 3000;
```

### Middleware Configuration

Various middleware are set up, including:
- Body parsing
- Cookie parsing
- Session management
- Passport initialization
- Static file serving

### Route Definitions

The application defines several route groups:
- `/auth`: Authentication routes
- `/profile`: User profile routes
- `/payment`: Payment processing routes
- `/license`: License server routes

### Stripe Webhook Handler

A webhook handler is set up to process Stripe events, particularly for handling successful checkout sessions.

## Key Functions

### Passport Strategy Setup

#### JWT Strategy

```javascript
passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_TOKEN,
    },
    async (jwtPayload, done) => {
        // Strategy implementation
    }
));
```

#### Google Strategy

```javascript
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        // Strategy implementation
    }
));
```

### Stripe Webhook Handler

```javascript
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    // Webhook handling logic
});
```

## Usage

To start the server:

```javascript
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

## Project Structure Integration

This file (`index.js`) acts as the central configuration and setup file for the entire application. It integrates with:

- Route files in the `routes` directory
- View templates in the `views` directory
- Database models in the `models` directory
- Localization files in the `locales` directory
- The `license-server.js` file for license-related functionality

## Conclusion

This file sets up a comprehensive web application with authentication, internationalization, and payment processing capabilities. It serves as the core of the application, integrating various components and setting up the necessary configurations for the server to function.