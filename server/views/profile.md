# User Profile View (profile.ejs)

## Overview

This file is an EJS template for the user profile page in the AutoCode application. It displays user information, allows profile editing, shows license usage, subscription details, and connected devices. The page includes both HTML structure and embedded JavaScript for dynamic content and interactions.

## File Structure

- **Location**: `views/profile.ejs`
- **Type**: EJS Template

## Template Sections

### 1. HTML Structure

The template defines the following main sections:

- User Profile Information
- Edit Profile Form
- License Usage
- Subscription Information
- Device Information

### 2. Styling

Includes an embedded CSS section for styling the page elements, creating a dark-themed, futuristic look with gradients and neon colors.

### 3. JavaScript Functionality

Embedded JavaScript handles:

- Profile updates
- Fetching and displaying license usage
- Fetching and displaying subscription information
- Fetching and displaying device information
- Subscription cancellation

## Key Features

### User Profile Display

Displays the user's username, email, and subscription tier.

```html
<div class="profile-info">
    <p><strong>Username:</strong> <%= user.username %></p>
    <p><strong>Email:</strong> <%= user.email %></p>
    <p><strong>Tier:</strong> <%= user.tier %></p>
    <% if (user.tier === 'Free') { %>
    <a href="/payment/create-checkout-session" class="upgrade-button">Upgrade to Premium</a>
    <% } %>
</div>
```

### Edit Profile Form

Allows users to update their name and email.

```html
<div class="edit-form">
    <h2>Edit Profile</h2>
    <form id="updateProfileForm">
        <input type="text" id="name" placeholder="Name" value="<%= user.name || user.username %>" />
        <input type="email" id="email" placeholder="Email" value="<%= user.email %>" />
        <button type="submit">Update Profile</button>
    </form>
</div>
```

### License Usage Display

Shows the user's API request usage with a progress bar.

```html
<div class="license-usage">
    <h2>License Usage</h2>
    <p>Requests today: <span id="requestsToday"></span> / <span id="dailyLimit"></span></p>
    <div class="progress-bar">
        <div class="progress" id="usageProgress"></div>
    </div>
</div>
```

### Subscription Information

Displays the user's current subscription tier and status.

```html
<div class="subscription-info">
    <h2>Subscription Information</h2>
    <p>Current Tier: <span id="currentTier"></span></p>
    <p>Subscription Status: <span id="subscriptionStatus"></span></p>
    <% if (user.tier !== 'Free') { %>
    <button id="cancelSubscription" class="cancel-subscription">Cancel Subscription</button>
    <% } %>
</div>
```

### Device Information

Lists the user's connected devices and device limits.

```html
<div class="device-info">
    <h2>Device Information</h2>
    <p>Devices: <span id="deviceCount"></span> / <span id="deviceLimit"></span></p>
    <ul id="deviceList" class="device-list"></ul>
</div>
```

## JavaScript Functions

### updateProfileForm Event Listener

Handles the profile update form submission.

```javascript
document.getElementById("updateProfileForm").addEventListener("submit", async (e) => {
    // ... (implementation details)
});
```

### fetchLicenseUsage()

Fetches and displays the user's license usage information.

```javascript
async function fetchLicenseUsage() {
    // ... (implementation details)
}
```

### fetchSubscriptionInfo()

Retrieves and displays the user's subscription details.

```javascript
async function fetchSubscriptionInfo() {
    // ... (implementation details)
}
```

### fetchDeviceInfo()

Fetches and displays information about the user's connected devices.

```javascript
async function fetchDeviceInfo() {
    // ... (implementation details)
}
```

### cancelSubscription Event Listener

Handles the subscription cancellation process.

```javascript
document.getElementById("cancelSubscription")?.addEventListener("click", async () => {
    // ... (implementation details)
});
```

## Usage in Project

This template is likely rendered by a route handler in `routes/profile.js` when a user accesses their profile page. It interacts with various backend endpoints to fetch and update user data, making it a central part of the user's interaction with their account settings and usage information in the AutoCode application.

## Dependencies

- Requires authentication token stored in localStorage
- Depends on various backend API endpoints for data fetching and updates
- Uses EJS for server-side rendering of dynamic content

## Notes

- The template includes responsive design elements for better display across different devices.
- Regular interval updates (every 60 seconds) are set for license usage information to keep it current.
- Error handling is implemented for all asynchronous operations to provide user feedback on failures.

This documentation provides a comprehensive overview of the `profile.ejs` file, detailing its structure, functionality, and role within the AutoCode project.