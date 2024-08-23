# Project Documentation: Autocode Registration

## Overview

This `package.json` file is the configuration file for a Node.js project named "autocode-registration". It's an Express.js application designed for user registration, payment processing, and license management. The project uses various dependencies to handle authentication, database operations, payment processing, and internationalization.

## Project Details

-   **Name**: autocode-registration
-   **Version**: 1.0.0
-   **Description**: Express.js application for user registration, payment processing, and license management
-   **Main Entry Point**: index.js
-   **Type**: ES Module

## Scripts

-   `start`: Runs the application using Node.js
-   `dev`: Runs the application using Nodemon for development with hot-reloading
-   `lint`: Runs ESLint for code quality checking

## Dependencies

The project uses several key dependencies:

-   **Express.js**: Web application framework
-   **Mongoose**: MongoDB object modeling tool
-   **Passport.js**: Authentication middleware (with strategies for local, JWT, and Google OAuth)
-   **Stripe**: Payment processing
-   **bcrypt**: Password hashing
-   **jsonwebtoken**: JWT implementation
-   **ejs**: Templating engine

## Dev Dependencies

-   **eslint**: JavaScript linting utility

## Engine Requirements

-   Node.js version 20.0.0 or higher

## Project Structure

The `package.json` file is part of a larger project structure that includes:

-   Docker configuration files (`docker-compose.yml`, `Dockerfile`)
-   Main application file (`index.js`)
-   License server file (`license-server.js`)
-   View templates in the `views` directory
-   Route handlers in the `routes` directory
-   Database models in the `models` directory
-   Middleware in the `middleware` directory
-   Localization files in the `locales` directory

## Usage

To install dependencies:

```bash
npm install
```

To start the application:

```bash
npm start
```

For development with hot-reloading:

```bash
npm run dev
```

To run linting:

```bash
npm run lint
```

## Notes

-   The project uses ES modules (`"type": "module"`)
-   Environment variables should be configured in a `.env` file (not included in the repository)

## Security Considerations

-   Sensitive information (API keys, database credentials) should be stored in environment variables, not in the `package.json` file
-   Regular updates of dependencies are recommended to address potential security vulnerabilities

This `package.json` file serves as the central configuration for the project, defining its dependencies, scripts, and metadata. It plays a crucial role in managing the project's Node.js environment and dependencies.
