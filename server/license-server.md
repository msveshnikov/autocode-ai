# License Server Documentation

## Overview

This file (`server/license-server.js`) implements a simple license server using Express.js. It provides user registration, login, and license checking functionality. The server manages user accounts, issues JWT tokens for authentication, and enforces usage limits based on user tiers.

## File Role

Within the project structure, this file serves as the backend component for license management. It interacts with the `licenseManager.js` file in the root directory, which likely handles the frontend or client-side license operations.

## Dependencies

- express: Web application framework
- body-parser: Middleware for parsing JSON request bodies
- jsonwebtoken (jwt): For generating and verifying JSON Web Tokens
- bcrypt: For hashing and comparing passwords
- uuid: For generating unique user IDs

## Configuration

- The server runs on the port specified by the `PORT` environment variable, defaulting to 3000.
- JWT secret key is set via the `JWT_SECRET` environment variable, with a fallback value.

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /register`

**Description:** Registers a new user and issues a JWT token.

**Parameters:**
- `username` (string): User's chosen username
- `password` (string): User's password
- `tier` (string): User's subscription tier (e.g., "Premium")

**Returns:**
- Success: JWT token
- Error: 400 status with error message if username already exists

**Example:**
```javascript
fetch('/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'newuser', password: 'password123', tier: 'Premium' })
})
.then(response => response.json())
.then(data => console.log(data.token));
```

### 2. User Login

**Endpoint:** `POST /login`

**Description:** Authenticates a user and issues a JWT token.

**Parameters:**
- `username` (string): User's username
- `password` (string): User's password

**Returns:**
- Success: JWT token
- Error: 401 status with error message for invalid credentials

**Example:**
```javascript
fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'existinguser', password: 'password123' })
})
.then(response => response.json())
.then(data => console.log(data.token));
```

### 3. License Check

**Endpoint:** `POST /check`

**Description:** Validates the user's token and checks license usage.

**Parameters:**
- JWT token in the Authorization header

**Returns:**
- Success: Object containing license validity, user tier, and daily request count
- Error: 401 status for invalid/missing token, 403 status for exceeded daily limit

**Example:**
```javascript
fetch('/check', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + jwtToken
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Internal Functions

### `bcrypt.hash(password, 10)`

Hashes the user's password for secure storage.

### `bcrypt.compare(password, hashedPassword)`

Compares a plain text password with a hashed password.

### `jwt.sign(payload, secretKey)`

Generates a JWT token with the user's information.

### `jwt.verify(token, secretKey)`

Verifies and decodes a JWT token.

## Data Structures

- `users`: Array storing user objects
- `licenses`: Object storing license usage information for each user

## Usage Limits

- Premium tier users have unlimited daily requests
- Other users are limited to 10 requests per day

## Error Handling

The server includes basic error handling for:
- Duplicate usernames during registration
- Invalid login credentials
- Missing or invalid JWT tokens
- Exceeded daily request limits

## Security Considerations

- Passwords are hashed before storage
- JWT is used for stateless authentication
- Environment variables are used for sensitive configuration

## Future Improvements

- Implement persistent storage for users and licenses
- Add more robust error handling and logging
- Implement rate limiting to prevent abuse
- Add endpoint for upgrading user tiers

This documentation provides a comprehensive overview of the license server implementation. Developers can use this as a guide to understand, maintain, and extend the functionality of the license management system.