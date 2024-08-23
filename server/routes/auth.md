# Authentication Routes Documentation

## Overview

This file (`routes/auth.js`) contains the authentication-related routes for the application. It handles user registration, login, logout, token verification, and contact inquiries. The routes use Express.js for routing, JWT for token-based authentication, and interact with the User and Inquiry models.

## Dependencies

- express
- jsonwebtoken
- User model (from `../models/user.js`)
- Inquiry model (from `../models/inquiry.js`)
- Authentication middleware (from `../middleware/auth.js`)

## Routes

### 1. User Registration

**Endpoint:** `POST /register`

Registers a new user in the system.

**Parameters:**
- `username` (string): User's chosen username
- `email` (string): User's email address
- `password` (string): User's password
- `tier` (string, optional): User's subscription tier (default: "Free")

**Returns:**
- 201 Status: JSON object containing a JWT token
- 400 Status: Error message if username or email already exists
- 500 Status: Error message if registration fails

**Example:**
```javascript
fetch('/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'newuser', email: 'user@example.com', password: 'password123' })
})
```

### 2. User Login

**Endpoint:** `POST /login`

Authenticates a user and provides a JWT token.

**Parameters:**
- `username` (string): User's username
- `password` (string): User's password

**Returns:**
- 200 Status: JSON object containing a JWT token
- 401 Status: Error message for invalid credentials
- 500 Status: Error message if login fails

**Example:**
```javascript
fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'existinguser', password: 'password123' })
})
```

### 3. User Logout

**Endpoint:** `POST /logout`

Logs out the authenticated user.

**Middleware:**
- `authCookie`: Verifies the authentication token

**Returns:**
- 200 Status: Success message

**Example:**
```javascript
fetch('/logout', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' }
})
```

### 4. Token Verification

**Endpoint:** `GET /check`

Verifies the user's token and returns user information.

**Middleware:**
- `authCookie`: Verifies the authentication token
- `checkUserTier`: Checks the user's subscription tier
- `checkRequestLimit`: Verifies if the user has exceeded their request limit

**Returns:**
- 200 Status: JSON object with token validity, user info, and tier
- 401 Status: Unauthorized if token is invalid

**Example:**
```javascript
fetch('/check', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer <token>' }
})
```

### 5. Contact Inquiry

**Endpoint:** `POST /contact`

Submits a contact inquiry.

**Parameters:**
- `name` (string): Inquirer's name
- `email` (string): Inquirer's email
- `subject` (string): Inquiry subject
- `message` (string): Inquiry message

**Returns:**
- 201 Status: Success message
- 500 Status: Error message if submission fails

**Example:**
```javascript
fetch('/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question',
    message: 'I have a question about your service.'
  })
})
```

## Error Handling

All routes include try-catch blocks to handle potential errors. In case of an error, an appropriate HTTP status code and error message are sent in the response.

## Project Context

This file is part of the authentication system in the project. It works in conjunction with:
- User and Inquiry models in the `models` directory
- Authentication middleware in the `middleware` directory
- Other route files in the `routes` directory

The routes defined here are likely to be used by the frontend views (in the `views` directory) for user authentication and interaction.