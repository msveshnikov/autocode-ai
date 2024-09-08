import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { exec } from "child_process";
import util from "util";
import FileManager from "./fileManager.js";
import { CONFIG } from "./config.js";

const execPromise = util.promisify(exec);

const AppStorePublisherAgent = {
    async run(projectStructure, readme) {
        console.log("App Store Publisher Agent: Starting publishing process...");

        const platform = await this.detectPlatform(projectStructure);
        if (!platform) {
            console.log("App Store Publisher Agent: Unable to detect platform. Exiting.");
            return;
        }

        await this.prepareApp(platform);
        await this.generateMetadata(platform, readme);
        await this.uploadScreenshots(platform);
        await this.submitForReview(platform);

        console.log("App Store Publisher Agent: Publishing process completed.");
    },

    async detectPlatform(projectStructure) {
        if (projectStructure["android"] || projectStructure["app.json"]) {
            return "android";
        } else if (projectStructure["ios"] || projectStructure["App.xcodeproj"]) {
            return "ios";
        }
        return null;
    },

    async prepareApp(platform) {
        console.log(`Preparing ${platform} app for submission...`);
        if (platform === "android") {
            await execPromise("./gradlew assembleRelease");
        } else if (platform === "ios") {
            await execPromise("xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release");
        }
    },

    async generateMetadata(platform, readme) {
        console.log("Generating app metadata...");
        const metadata = this.extractMetadataFromReadme(readme);

        if (platform === "android") {
            await FileManager.write("fastlane/metadata/android/en-US/full_description.txt", metadata.description);
            await FileManager.write("fastlane/metadata/android/en-US/short_description.txt", metadata.shortDescription);
        } else if (platform === "ios") {
            await FileManager.write("fastlane/metadata/en-US/description.txt", metadata.description);
            await FileManager.write("fastlane/metadata/en-US/keywords.txt", metadata.keywords.join(","));
        }
    },

    extractMetadataFromReadme(readme) {
        const descriptionMatch = readme.match(/## Description\s+([\s\S]+?)(?=\n#|$)/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : "";
        const shortDescription = description.split(".")[0];
        const keywordsMatch = readme.match(/## Keywords\s+([\s\S]+?)(?=\n#|$)/);
        const keywords = keywordsMatch
            ? keywordsMatch[1]
                  .trim()
                  .split(",")
                  .map((k) => k.trim())
            : [];

        return { description, shortDescription, keywords };
    },

    async uploadScreenshots(platform) {
        console.log("Uploading screenshots...");
        const screenshotDir = path.join(process.cwd(), "fastlane", "screenshots");
        const screenshots = await fs.readdir(screenshotDir);

        for (const screenshot of screenshots) {
            const filePath = path.join(screenshotDir, screenshot);
            if (platform === "android") {
                await this.uploadToGooglePlay(filePath);
            } else if (platform === "ios") {
                await this.uploadToAppStore(filePath);
            }
        }
    },

    async uploadToGooglePlay(filePath) {
        const formData = new FormData();
        formData.append("file", await fs.readFile(filePath));
        await fetch(`${CONFIG.licenseServerUrl}/api/google-play/upload`, {
            method: "POST",
            body: formData,
        });
    },

    async uploadToAppStore(filePath) {
        const formData = new FormData();
        formData.append("file", await fs.readFile(filePath));
        await fetch(`${CONFIG.licenseServerUrl}/api/app-store/upload`, {
            method: "POST",
            body: formData,
        });
    },

    async submitForReview(platform) {
        console.log("Submitting app for review...");
        if (platform === "android") {
            await execPromise("fastlane supply --track production");
        } else if (platform === "ios") {
            await execPromise("fastlane deliver --submit_for_review");
        }
    },
};

export default AppStorePublisherAgent;
