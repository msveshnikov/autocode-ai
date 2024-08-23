# AutoCode Registration System

## Project Overview

AutoCode Registration System is a comprehensive Express.js application designed to handle user registrations, process payments via Stripe, and manage user licenses using MongoDB. The system offers a tiered pricing model with Free, Premium, and Enterprise options, each providing different levels of access and features.

## Features

-   ES6, async/await, fetch
-   Morgan for logging
-   User registration and login
-   Stripe integration for payment processing
-   License management with daily request limits
-   Tiered pricing model (Free, Premium, Enterprise)
-   MongoDB integration for data storage
-   Docker support for easy deployment
-   User profile management
-   Express template engine for dynamic page rendering
-   Responsive design for mobile and desktop
-   Real-time license usage tracking
-   Automated email notifications
-   Contact form for user inquiries

## Architecture

The project is built using a microservices architecture, with the following main components:

1. **Web Server (index.js)**: Handles incoming HTTP requests, serves dynamic pages, and manages user registration and payment flow.
2. **License Server (license-server.js)**: Manages user authentication, license checking, and request limit enforcement.
3. **MongoDB**: Stores user and license data.
4. **Stripe**: Handles payment processing and subscription management.

### Module Interactions

-   The web server interacts with the license server to authenticate users and check license status.
-   Both servers communicate with MongoDB to store and retrieve user and license data.
-   The web server integrates with Stripe for payment processing and subscription management.
-   Google Sign-In API is used for alternative authentication.

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
    JWT_TOKEN=your-secret-key
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

    - Endpoint: `POST /register`
    - Body: `{ "username": "user", "password": "pass", "tier": "Free" }`

2. **Login**:

    - Endpoint: `POST /login`
    - Body: `{ "username": "user", "password": "pass" }`

3. **Google Sign-In**:

    - Endpoint: `GET /auth/google`

4. **License Check**:

    - Endpoint: `POST /check`
    - Headers: `Authorization: Bearer <token>`

5. **User Profile**:

    - Endpoint: `GET /profile`
    - Headers: `Authorization: Bearer <token>`

6. **Update Profile**:

    - Endpoint: `PUT /profile`
    - Headers: `Authorization: Bearer <token>`
    - Body: `{ "name": "New Name", "email": "new@email.com" }`

7. **Contact Form**:

    - Endpoint: `POST /contact`
    - Body: `{ "name": "User", "email": "user@example.com", "message": "Hello" }`

8. **Webhook Receiver**:

    - Endpoint: `POST /webhook`
    - Headers: `X-Webhook-Secret: <secret>`

### Stripe Integration

The system uses Stripe Checkout for payment processing. When a user registers for a paid tier, they are redirected to a Stripe Checkout page. Upon successful payment, Stripe sends a webhook to update the user's status in the database.

## Project Structure

```
.
├── docker-compose.yml
├── Dockerfile
├── index.js
├── license-server.js
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
    - 10 requests/day
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

## Monitoring and Analytics

-   Integrated Prometheus for system metrics collection
-   Added Grafana dashboards for real-time monitoring
-   Implemented custom analytics dashboard for user behavior insights
