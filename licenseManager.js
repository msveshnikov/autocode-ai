import { CONFIG } from "./config.js";

const serverUrl = CONFIG.licenseServerUrl;
let currentLicense = null;

const LicenseManager = {
    async login(username, password) {
        try {
            const response = await fetch(`${serverUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data = await response.json();
            currentLicense = data.license;
            return true;
        } catch (error) {
            console.error("Login failed:", error.message);
            return false;
        }
    },

    async register(username, password, tier) {
        try {
            const response = await fetch(`${serverUrl}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password, tier }),
            });
            if (!response.ok) throw new Error("Registration failed");
            const data = await response.json();
            currentLicense = data.license;
            return true;
        } catch (error) {
            console.error("Registration failed:", error.message);
            return false;
        }
    },

    async checkLicense() {
        return true;
        // if (!currentLicense) {
        //     return false;
        // }

        // try {
        //     const response = await fetch(`${serverUrl}/check`, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({ license: currentLicense }),
        //     });
        //     if (!response.ok) throw new Error("License check failed");
        //     const data = await response.json();
        //     return data.valid;
        // } catch (error) {
        //     console.error("License check failed:", error.message);
        //     return false;
        // }
    },

    getLicenseTier() {
        if (!currentLicense) {
            return "Free";
        }
        return currentLicense.tier;
    },

    getRemainingRequests() {
        if (!currentLicense) {
            return 10; // Free tier default
        }
        return currentLicense.tier === "Premium" ? Infinity : currentLicense.remainingRequests;
    },

    async decrementRequests() {
        if (currentLicense && currentLicense.tier !== "Premium") {
            try {
                const response = await fetch(`${serverUrl}/decrement`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ license: currentLicense }),
                });
                if (!response.ok) throw new Error("Failed to decrement requests");
                const data = await response.json();
                currentLicense = data.license;
            } catch (error) {
                console.error("Failed to decrement requests:", error.message);
            }
        }
    },
};

export default LicenseManager;
