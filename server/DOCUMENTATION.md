# AutoCode Registration System

## Project Overview

AutoCode Registration System is a comprehensive Express.js application designed to handle user registrations, process payments via Stripe, and manage user licenses using MongoDB. The system offers a tiered pricing model with Free, Premium, and Enterprise options, each providing different levels of access and features.

## Features

-   User registration and authentication
-   Tiered pricing model (Free, Premium, Enterprise)
-   Stripe integration for payment processing
-   License management with daily request limits
-   MongoDB integration for data storage
-   Docker support for easy deployment
-   User profile management
-   Express template engine (EJS) for dynamic page rendering
-   Responsive design for mobile and desktop
-   Real-time license usage tracking
-   Contact form for user inquiries
-   Security features: Helmet, rate limiting, CSRF protection
-   Logging with Morgan

## Architecture

The project follows a modular architecture, with the main components being:

1. **Web Server (index.js)**: The entry point of the application, handling HTTP requests, routing, and middleware setup.
2. **License Server (license-server.js)**: Manages user authentication, license checking, and request limit enforcement.
3. **MongoDB**: Stores user and license data.
4. **Stripe Integration**: Handles payment processing and subscription management.

### Module Interactions

-   The web server (index.js) sets up the Express application and routes requests to appropriate handlers.
-   Authentication routes (auth.js) handle user registration and login.
-   Profile routes (profile.js) manage user profile information.
-   Payment routes (payment.js) interact with Stripe for payment processing.
-   The license server (license-server.js) checks user authentication and enforces request limits.
-   All components interact with MongoDB to store and retrieve data.

## Installation and Setup

1. Clone the repository:

    ```
    git clone https://github.com/your-repo/autocode-registration.git
    cd autocode-registration
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Set up environment variables:
   Create a `.env` file in the project root and add the following variables:

    ```
    NODE_ENV=production
    MONGODB_URI=mongodb://mongo:27017/autocode
    JWT_TOKEN=your-jwt-secret
    SESSION_SECRET=your-session-secret
    STRIPE_SECRET_KEY=your-stripe-secret-key
    STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    ```

4. Build and run the Docker containers:
    ```
    docker-compose up --build
    ```

## Usage

### API Endpoints

1. **Registration**:

    - `POST /auth/register`
    - Body: `{ "username": "user", "email": "user@example.com", "password": "password" }`

2. **Login**:

    - `POST /auth/login`
    - Body: `{ "username": "user", "password": "password" }`

3. **License Check**:

    - `POST /license/check`
    - Headers: `Authorization: Bearer <token>`

4. **User Profile**:

    - `GET /profile`
    - Headers: `Authorization: Bearer <token>`

5. **Update Profile**:

    - `PUT /profile`
    - Headers: `Authorization: Bearer <token>`
    - Body: `{ "name": "New Name", "email": "new@email.com" }`

6. **Contact Form**:

    - `POST /contact`
    - Body: `{ "name": "User", "email": "user@example.com", "message": "Hello" }`

7. **Create Checkout Session**:

    - `POST /payment/create-checkout-session`
    - Headers: `Authorization: Bearer <token>`
    - Body: `{ "priceId": "price_xxxxxxxxxxxxx" }`

8. **Webhook Receiver**:
    - `POST /payment/webhook`
    - Headers: `Stripe-Signature: <signature>`

### Stripe Integration

The system uses Stripe Checkout for payment processing. When a user upgrades to a paid tier, they are redirected to a Stripe Checkout page. Upon successful payment, Stripe sends a webhook to update the user's status in the database.

## Project Structure

```
.
├── docker-compose.yml
├── Dockerfile
├── index.js
├── license-server.js
├── config.js
├── utils.js
├── views/
│   ├── landing.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── profile.ejs
│   ├── success.ejs
│   ├── cancel.ejs
│   └── contact.ejs
├── routes/
│   ├── auth.js
│   ├── profile.js
│   └── payment.js
├── middleware/
│   └── auth.js
├── models/
│   ├── user.js
│   └── inquiry.js
└── package.json
```

## Pricing Tiers

1. **Free Tier**

    - $0/month
    - 100 requests/day
    - Basic features
    - 3 devices
    - Community support

2. **Premium**

    - $10/month
    - Unlimited requests
    - All features
    - 10 devices
    - Priority support

3. **Enterprise**
    - Custom pricing
    - Unlimited requests
    - All features + custom integrations
    - Unlimited devices
    - Dedicated support team
    - On-premises deployment option

## Security Measures

-   JWT for authentication
-   Helmet for setting various HTTP headers
-   Rate limiting to prevent abuse
-   CSRF protection
-   Secure session management
-   Input sanitization

## Logging and Monitoring

-   Morgan for HTTP request logging
-   Error handling middleware for catching and logging errors

## Future Improvements

-   Implement email verification for new registrations
-   Add two-factor authentication option
-   Integrate with additional payment providers
-   Implement a more robust analytics system for usage tracking
-   Create an admin dashboard for managing users and subscriptions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
