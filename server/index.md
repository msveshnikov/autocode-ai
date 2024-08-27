# index.js Documentation

## Overview

This file serves as the main entry point for a Node.js Express application. It sets up the server, configures middleware, defines routes, and handles various functionalities including authentication, payment processing, and user management.

## Dependencies

-   express: Web application framework
-   mongoose: MongoDB object modeling tool
-   Stripe: Payment processing library
-   path, url: Node.js built-in modules for file and URL operations
-   cookie-parser: Middleware for parsing cookies
-   express-rate-limit: Rate limiting middleware
-   morgan: HTTP request logger middleware
-   dotenv: Module to load environment variables from a .env file

## Configuration

1. Environment variables are loaded using `dotenv.config()`.
2. Express application is initialized.
3. MongoDB connection is established using the `MONGODB_URI` environment variable.
4. Various middleware are set up for security, parsing, session management, and logging.
5. View engine is set to EJS and static files are served from the 'public' directory.
6. Rate limiting is configured to allow 100 requests per 15 minutes.

## Routes

The application defines several routes:

-   `/auth`: Authentication routes (defined in `./routes/auth.js`)
-   `/profile`: User profile routes (defined in `./routes/profile.js`)
-   `/payment`: Payment-related routes (defined in `./routes/payment.js`)
-   `/`: Renders the landing page
-   `/login`: Renders the login page
-   `/register`: Renders the registration page
-   `/contact`: Renders the contact page
-   `/webhook`: Handles Stripe webhook events

## Stripe Webhook Handler

The `/webhook` route handles Stripe webhook events, specifically the `checkout.session.completed` event. When a checkout is completed:

1. It verifies the webhook signature.
2. Retrieves the user associated with the checkout session.
3. Updates the user's tier to "Premium" and saves the Stripe customer ID.

## Server Startup

The server listens on the port specified by the `PORT` environment variable or defaults to 3000.

## Usage

To start the server:

```javascript
node index.js
```

## Project Structure Integration

This file integrates various components of the project:

-   Models: Imports the User model from `./models/user.js`
-   Routes: Imports and uses route modules from the `./routes` directory
-   Views: Sets up EJS as the view engine and specifies the views directory
-   Middleware: Applies custom middleware like `licenseServer` from `./license-server.js`

## Environment Variables

The following environment variables should be set:

-   `PORT`: Server port number
-   `MONGODB_URI`: MongoDB connection string
-   `STRIPE_SECRET_KEY`: Stripe API secret key
-   `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for verifying webhook events

## Security Features

-   Implements rate limiting to prevent abuse
-   Uses HTTPS-only cookies (when in production)
-   Parses raw body for Stripe webhooks to ensure integrity

## Error Handling

Basic error handling is implemented for the Stripe webhook. More comprehensive error handling should be added for production use.

## Exports

The Express `app` instance is exported as the default export, allowing it to be imported and used in other parts of the application or for testing purposes.
