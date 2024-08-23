# AutoCode Registration System

## Project Overview

AutoCode Registration System is a comprehensive Express.js application designed to handle user registrations, process payments via Stripe, and manage user licenses using MongoDB. The system offers a tiered pricing model with Free, Premium, and Enterprise options, each providing different levels of access and features.

## Features

- User registration and authentication (including Google Sign-In)
- Tiered pricing model (Free, Premium, Enterprise)
- Stripe integration for payment processing
- License management with daily request limits
- User profile management
- Real-time license usage tracking
- Automated email notifications
- Contact form for user inquiries
- Responsive design for mobile and desktop
- Docker support for easy deployment

## Architecture

The project follows a microservices architecture, consisting of the following main components:

1. **Web Server (index.js)**: Handles HTTP requests, serves dynamic pages, and manages user registration and payment flow.
2. **License Server (license-server.js)**: Manages user authentication, license checking, and request limit enforcement.
3. **MongoDB**: Stores user and license data.
4. **Stripe**: Handles payment processing and subscription management.

### Module Interactions

- The web server (index.js) interacts with the license server (license-server.js) to authenticate users and check license status.
- Both servers communicate with MongoDB to store and retrieve user and license data.
- The web server integrates with Stripe for payment processing and subscription management.
- Google Sign-In API is used for alternative authentication.

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
   SESSION_SECRET=your-session-secret
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
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
   - Body: `{ "username": "user", "password": "pass", "email": "user@example.com", "tier": "Free" }`

2. **Login**:
   - `POST /auth/login`
   - Body: `{ "username": "user", "password": "pass" }`

3. **Google Sign-In**:
   - `GET /auth/google`

4. **License Check**:
   - `POST /license/check`
   - Headers: `Authorization: Bearer <token>`

5. **User Profile**:
   - `GET /profile`
   - Headers: `Authorization: Bearer <token>`

6. **Update Profile**:
   - `PUT /profile`
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ "name": "New Name", "email": "new@email.com" }`

7. **Contact Form**:
   - `POST /contact`
   - Body: `{ "name": "User", "email": "user@example.com", "message": "Hello" }`

### Stripe Integration

The system uses Stripe Checkout for payment processing. When a user upgrades to a paid tier, they are redirected to a Stripe Checkout page. Upon successful payment, Stripe sends a webhook to update the user's status in the database.

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

## Security Measures

- Helmet.js for setting various HTTP headers
- Rate limiting to prevent abuse
- JWT for secure authentication
- HTTPS enforcement in production
- Input validation and sanitization
- Secure password hashing with bcrypt

## Logging and Monitoring

- Morgan for HTTP request logging
- Custom error handling middleware
- Stripe webhook monitoring for payment events

## Future Improvements

- Implement email verification for new users
- Add two-factor authentication option
- Integrate a more robust analytics system
- Implement a dashboard for license usage visualization
- Add support for multiple payment providers

## Contributing

Please read our CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.