import { CONFIG } from "./config.js";

const serverUrl = CONFIG.licenseServerUrl;
let currentToken = null;

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
            currentToken = data.token;
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
            currentToken = data.token;
            return true;
        } catch (error) {
            console.error("Registration failed:", error.message);
            return false;
        }
    },

    async checkLicense() {
        if (!currentToken) {
            return true;
        }

        try {
            const response = await fetch(`${serverUrl}/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
            });
            if (!response.ok) throw new Error("License check failed");
            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error("License check failed:", error.message);
            return false;
        }
    },

    getLicenseTier() {
        if (!currentToken) {
            return "Free";
        }
        const decodedToken = JSON.parse(atob(currentToken.split(".")[1]));
        return decodedToken.tier;
    },

    getRemainingRequests() {
        if (!currentToken) {
            return CONFIG.pricingTiers.free.requestsPerDay;
        }
        const decodedToken = JSON.parse(atob(currentToken.split(".")[1]));
        return decodedToken.tier === "Premium" ? Infinity : CONFIG.pricingTiers.free.requestsPerDay;
    },

    async decrementRequests() {
        if (currentToken) {
            await this.checkLicense();
        }
    },
};

export default LicenseManager;
