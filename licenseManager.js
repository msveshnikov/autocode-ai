import { CONFIG } from "./config.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import chalk from "chalk";
import UserInterface from "./userInterface.js";

const serverUrl = CONFIG.licenseServerUrl;
let currentToken = null;
const tokenFile = path.join(os.homedir(), ".autocode_token");
const usageFile = path.join(os.homedir(), ".autocode_usage");

const LicenseManager = {
    async login(email, password) {
        try {
            const response = await fetch(`${serverUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data = await response.json();
            currentToken = data.token;
            await this.saveToken(currentToken);
            return true;
        } catch  {
            return false;
        }
    },

    async checkLicense() {
        if (!currentToken) {
            await this.loadToken();
        }

        if (!currentToken) {
            return this.checkLocalTrialLicense();
        }

        try {
            const response = await fetch(`${serverUrl}/license/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log(chalk.yellow("Your session has expired. Please login again."));
                    await UserInterface.handleLogin();
                    return this.checkLicense();
                }
                throw new Error("License check failed");
            }
            const data = await response.json();
            return data.message === "Request allowed";
        } catch (error) {
            console.log(chalk.red(error.message));
            return false;
        }
    },

    async checkLocalTrialLicense() {
        const usage = await this.loadUsage();
        if (usage.requests >= 10) {
            return false;
        }

        usage.requests++;
        await this.saveUsage(usage);
        return true;
    },

    async getLicenseTier() {
        if (!currentToken) {
            await this.loadToken();
        }

        if (!currentToken) {
            return "Local Trial";
        }

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
            return "Free";
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
        } catch  {
            // Token file doesn't exist or is invalid
        }
    },

    async saveUsage(usage) {
        await fs.writeFile(usageFile, JSON.stringify(usage), "utf8");
    },

    async loadUsage() {
        try {
            const data = await fs.readFile(usageFile, "utf8");
            return JSON.parse(data);
        } catch {
            return { date: "", requests: 0 };
        }
    },
};

export default LicenseManager;
