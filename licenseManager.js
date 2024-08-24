import { CONFIG } from "./config.js";
import fs from "fs/promises";
import path from "path";

const serverUrl = CONFIG.licenseServerUrl;
let currentToken = null;
const tokenFile = path.join(process.cwd(), ".autocode_token");
let dailyRequests = 0;
let lastRequestDate = null;

const LicenseManager = {
    async login(username, password) {
        try {
            const response = await fetch(`${serverUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data = await response.json();
            currentToken = data.token;
            await this.saveToken(currentToken);
            return true;
        } catch (error) {
            console.error("Login failed:", error.message);
            return false;
        }
    },

    async checkLicense() {
        if (!currentToken) {
            await this.loadToken();
        }

        if (!currentToken) {
            return this.checkFreeTierLicense();
        }

        try {
            const response = await fetch(`${serverUrl}/license/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
            });
            if (!response.ok) throw new Error("License check failed");
            const data = await response.json();
            return data.message === "Request allowed";
        } catch (error) {
            console.error("License check failed:", error.message);
            return false;
        }
    },

    checkFreeTierLicense() {
        const today = new Date().toISOString().split("T")[0];
        if (lastRequestDate !== today) {
            dailyRequests = 0;
            lastRequestDate = today;
        }

        if (dailyRequests >= CONFIG.pricingTiers.free.requestsPerDay) {
            return false;
        }

        dailyRequests++;
        return true;
    },

    async getLicenseTier() {
        try {
            const response = await fetch(`${serverUrl}/license/tier-info`, {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                },
            });
            if (!response.ok) throw new Error("Failed to get tier info");
            const data = await response.json();
            return data.name;
        } catch (error) {
            console.error("Failed to get tier info:", error.message);
            return "Free Tier";
        }
    },

    async saveToken(token) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 14);
        const tokenData = JSON.stringify({ token, expirationDate });
        await fs.writeFile(tokenFile, tokenData, "utf8");
    },

    async loadToken() {
        try {
            const tokenData = await fs.readFile(tokenFile, "utf8");
            const { token, expirationDate } = JSON.parse(tokenData);
            if (new Date(expirationDate) > new Date()) {
                currentToken = token;
            } else {
                await fs.unlink(tokenFile);
            }
        } catch (error) {
            // Token file doesn't exist or is invalid
        }
    },
};

export default LicenseManager;
