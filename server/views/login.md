# Login View Documentation

## Overview

This file (`views/login.ejs`) contains the HTML, CSS, and JavaScript for the login page of the AutoCode application. It's an EJS (Embedded JavaScript) template that renders a responsive login form with options for traditional username/password login and Google OAuth login

## File Structure

```
views/
└── login.ejs
```

## Template Details

### HTML Structure

The template creates a centered login form with the following elements:

-   Login header
-   Error message display (if applicable)
-   Username input field
-   Password input field
-   Login button
-   Google login button

### Styling

The page uses inline CSS to create a futuristic, dark-themed interface with the following key features:

-   Gradient background
-   Semi-transparent login container
-   Glowing effects on inputs and buttons
-   Responsive design for various screen sizes

### Client-side JavaScript

The template includes two main JavaScript functionalities:

1. Form submission handling

## Key Components

### Login Form

```html
<form id="loginForm">
    <input type="text" id="username" name="username" placeholder="<%= __('Username') %>" required />
    <input type="password" id="password" name="password" placeholder="<%= __('Password') %>" required />
    <button type="submit"><%= __('Login') %></button>
</form>
```

This form captures the user's credentials and submits them asynchronously.

### Google Login Button

```html
<button class="google-login" onclick="window.location.href='/auth/google'"><%= __('Login with Google') %></button>
```

This button redirects the user to the Google OAuth flow.

## JavaScript Functionality

### Form Submission

```javascript
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    // ... (form submission logic)
});
```

This event listener handles the form submission:

1. Prevents the default form submission
2. Extracts username and password
3. Sends a POST request to `/login`
4. Handles the response:
    - On success: Stores the token and redirects to the profile page
    - On failure: Displays an error message

## Usage in the Project

This login view is likely rendered by a route handler in `routes/auth.js` when a user navigates to the login page. It integrates with:

-   The authentication system (handling login requests)
-   The Google OAuth flow (for alternative login method)

## Security Considerations

-   The form uses HTTPS for secure data transmission (assuming proper server configuration)
-   Passwords are not logged or exposed in the frontend code
-   The login token is stored in `localStorage`, which may have security implications depending on the application's requirements

## Potential Improvements

1. Implement CSRF protection
2. Add password strength indicators
3. Implement rate limiting on the login API
4. Consider using HttpOnly cookies instead of localStorage for token storage

By understanding this login view and its place in the project structure, developers can effectively maintain and extend the login functionality of the AutoCode application.
