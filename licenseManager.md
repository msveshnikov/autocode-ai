# LicenseManager Module Documentation

## Overview

The `licenseManager.js` file is a crucial component of the Autocode project, responsible for managing user authentication, license verification, and usage tracking. It interfaces with a license server to validate user credentials and check license status, while also providing a local trial license option for users without an active subscription.

## Key Components

-   User authentication (login)
-   License verification
-   Local trial license management
-   License tier information retrieval
-   Token and usage data persistence

## Imported Dependencies

-   `CONFIG`: Configuration object from `./config.js`
-   `fs`: File system module (promises version)
-   `path`: Path manipulation utility
-   `os`: Operating system-related utility
-   `chalk`: Terminal string styling
-   `UserInterface`: Custom module for handling user interactions

## Constants

-   `serverUrl`: URL of the license server
-   `tokenFile`: Path to the file storing the authentication token
-   `usageFile`: Path to the file storing local usage data

## Methods

### `login(email, password)`

Authenticates a user with the license server.

**Parameters:**

-   `email` (string): User's email address
-   `password` (string): User's password

**Returns:**

-   `Promise<boolean>`: `true` if login is successful, `false` otherwise

**Usage Example:**

```javascript
const success = await LicenseManager.login("user@example.com", "password123");
if (success) {
    console.log("Login successful");
} else {
    console.log("Login failed");
}
```

### `checkLicense()`

Verifies the user's license status with the server or checks the local trial license.

**Returns:**

-   `Promise<boolean>`: `true` if the license is valid, `false` otherwise

**Usage Example:**

```javascript
const isLicenseValid = await LicenseManager.checkLicense();
if (isLicenseValid) {
    console.log("License is valid");
} else {
    console.log("License is invalid or expired");
}
```

### `checkLocalTrialLicense()`

Checks and updates the local trial license usage.

**Returns:**

-   `Promise<boolean>`: `true` if the trial license is still valid, `false` if exceeded

### `getLicenseTier()`

Retrieves the user's current license tier.

**Returns:**

-   `Promise<string>`: The name of the license tier

**Usage Example:**

```javascript
const tier = await LicenseManager.getLicenseTier();
console.log(`Current license tier: ${tier}`);
```

### `saveToken(token)`

Saves the authentication token to a local file.

**Parameters:**

-   `token` (string): The authentication token to save

### `loadToken()`

Loads the authentication token from the local file.

### `saveUsage(usage)`

Saves the local trial usage data to a file.

**Parameters:**

-   `usage` (object): The usage data to save

### `loadUsage()`

Loads the local trial usage data from the file.

**Returns:**

-   `Promise<object>`: The usage data object

## Integration with Project

The `LicenseManager` module plays a central role in the Autocode project:

1. It's likely used by the main `index.js` file to verify license status before performing key operations.
2. It interacts with the `UserInterface` module to handle login scenarios.
3. It relies on the `config.js` file for server URL configuration.
4. It indirectly interacts with the server-side components, particularly the `/auth` and `/license` routes defined in the server's `routes` directory.

## Error Handling

The module includes error handling for network requests, file operations, and invalid tokens. It uses `console.error` to log errors and returns `false` or default values in error scenarios to prevent crashes.

## Security Considerations

-   The module stores authentication tokens locally, which expire after 14 days.
-   Passwords are never stored locally, only sent securely to the server during login.
-   HTTPS should be used for all server communications to ensure data security.

## Conclusion

The `LicenseManager` module is essential for managing user access and enforcing licensing rules within the Autocode application. It provides a flexible system that supports both server-authenticated licenses and a local trial option, ensuring smooth operation and proper access control for the application's features.
