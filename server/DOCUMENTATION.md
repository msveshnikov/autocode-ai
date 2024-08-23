# AutoCode Registration System - Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Module Interactions](#module-interactions)
5. [Installation and Setup](#installation-and-setup)
6. [Usage](#usage)
7. [API Endpoints](#api-endpoints)
8. [Stripe Integration](#stripe-integration)
9. [Project Structure](#project-structure)
10. [Pricing Tiers](#pricing-tiers)
11. [Multi-language Support](#multi-language-support)

## Project Overview

AutoCode Registration System is a comprehensive Express.js application designed to handle user registrations, process payments via Stripe, and manage user licenses using MongoDB. The system offers a tiered pricing model with Free, Premium, and Enterprise options, each providing different levels of access and features.

The application is built using modern web technologies and follows best practices for scalability, security, and user experience. It leverages Docker for easy deployment and includes features such as Google Sign-In integration, multi-language support, and real-time license usage tracking.

## Features

-   ES6, async/await, fetch
-   User registration and login
-   Google Sign-In integration
-   Stripe integration for payment processing
-   License management with daily request limits
-   Tiered pricing model (Free, Premium, Enterprise)
-   MongoDB integration for data storage
-   Docker support for easy deployment
-   User profile management
-   Express template engine (EJS) for dynamic page rendering
-   Multi-language support (i18n)
-   Responsive design for mobile and desktop
-   Real-time license usage tracking
-   Automated email notifications (to be implemented)

## Architecture

The AutoCode Registration System is built using a microservices architecture, consisting of the following main components:

1. **Web Server (index.js)**: The main entry point of the application, handling incoming HTTP requests, serving dynamic pages, and managing the user registration and payment flow.

2. **License Server (license-server.js)**: A separate module responsible for managing user authentication, license checking, and enforcing request limits based on the user's subscription tier.

3. **MongoDB**: The primary data store for user information, license data, and usage statistics.

4. **Stripe**: External service integrated for payment processing and subscription management.

The application uses Express.js as the web framework, Passport.js for authentication (including Google Sign-In), and Mongoose as an ODM for MongoDB interactions.

## Module Interactions

-   The web server (index.js) interacts with the license server (license-server.js) to authenticate users and check license status for each request.
-   Both servers communicate with MongoDB to store and retrieve user and license data.
-   The web server integrates with Stripe for payment processing and subscription management, handling webhooks for payment status updates.
-   Google Sign-In API is used as an alternative authentication method, managed through Passport.js.
-   The i18n module is used throughout the application to provide multi-language support.

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
    SESSION_SECRET=your-session-secret
    ```

4. Build and run the Docker containers:
    ```
    docker-compose up --build
    ```

## Usage

After setting up the project, you can access the application at `http://localhost:3000`. The main functionalities include:

-   User registration and login
-   Google Sign-In
-   Viewing and updating user profiles
-   Subscribing to different pricing tiers
-   Checking license status and usage

## API Endpoints

1. **Registration**:

    - Endpoint: `POST /auth/register`
    - Body: `{ "username": "user", "password": "pass", "email": "user@example.com" }`

2. **Login**:

    - Endpoint: `POST /auth/login`
    - Body: `{ "username": "user", "password": "pass" }`

3. **Google Sign-In**:

    - Endpoint: `GET /auth/google`

4. **License Check**:

    - Endpoint: `POST /license/check`
    - Headers: `Authorization: Bearer <token>`

5. **User Profile**:

    - Endpoint: `GET /profile`
    - Headers: `Authorization: Bearer <token>`

6. **Update Profile**:

    - Endpoint: `PUT /profile`
    - Headers: `Authorization: Bearer <token>`
    - Body: `{ "name": "New Name", "email": "new@email.com" }`

7. **Tier Information**:

    - Endpoint: `GET /license/tier-info`
    - Headers: `Authorization: Bearer <token>`

8. **Update Tier**:
    - Endpoint: `PUT /license/update-tier`
    - Headers: `Authorization: Bearer <token>`
    - Body: `{ "tier": "Premium" }`

## Stripe Integration

The system uses Stripe Checkout for payment processing. When a user registers for a paid tier:

1. They are redirected to a Stripe Checkout page.
2. Upon successful payment, Stripe sends a webhook to the `/webhook` endpoint.
3. The webhook handler updates the user's status in the database.

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
│   └── cancel.ejs
├── routes/
│   ├── auth.js
│   ├── profile.js
│   └── payment.js
├── middleware/
│   └── auth.js
├── models/
│   └── user.js
├── locales/
│   ├── en.json
│   ├── es.json
│   └── fr.json
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

## Multi-language Support

The application supports multiple languages using the i18n library. Language files are stored in the `locales` directory. Users can switch between languages in their profile settings. Currently supported languages are:

-   English (en)
-   Spanish (es)
-   French (fr)

To add more languages, create new JSON files in the `locales` directory and add the corresponding translations.

---

This documentation provides a comprehensive overview of the AutoCode Registration System, including its architecture, features, setup instructions, and usage guidelines. For more detailed information on specific components or functionalities, refer to the inline comments in the source code or contact the development team.
