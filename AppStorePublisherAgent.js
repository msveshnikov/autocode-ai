import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { exec } from "child_process";
import util from "util";
import FileManager from "./fileManager.js";
import { CONFIG } from "./config.js";
import UserInterface from "./userInterface.js";
import CodeGenerator from "./codeGenerator.js";

const execPromise = util.promisify(exec);

const AppStorePublisherAgent = {
    async run(projectStructure, readme) {
        console.log("App Store Publisher Agent: Starting publishing process...");
        await CodeGenerator.createAppDescriptionFiles(projectStructure, readme);

        const platform = await this.detectPlatform(projectStructure);
        if (!platform) {
            console.log("App Store Publisher Agent: Unable to detect platform. Exiting.");
            return;
        }

        await this.prepareApp(platform);
        await this.generateMetadata(platform, readme);
        await this.createDescriptionFiles(platform);
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

    async createDescriptionFiles(platform) {
        console.log("Creating app description and metadata files...");
        const metadata = await this.generateAppMetadata();

        const metadataDir = path.join(
            process.cwd(),
            "fastlane",
            "metadata",
            platform === "android" ? "android" : "ios",
            "en-US"
        );
        await fs.mkdir(metadataDir, { recursive: true });

        const files = {
            "name.txt": metadata.name,
            "subtitle.txt": metadata.subtitle,
            "privacy_url.txt": metadata.privacyUrl,
            "support_url.txt": metadata.supportUrl,
            "marketing_url.txt": metadata.marketingUrl,
            "release_notes.txt": metadata.releaseNotes,
        };

        for (const [fileName, content] of Object.entries(files)) {
            await FileManager.write(path.join(metadataDir, fileName), content);
        }

        console.log("App description and metadata files created successfully.");
    },

    async generateAppMetadata() {
        const prompt = `Generate app metadata for the App Store and Google Play Store, including:
        1. App name
        2. Subtitle
        3. Privacy policy URL
        4. Support URL
        5. Marketing URL
        6. Release notes for the latest version

        Provide the information in a JSON format.`;

        const metadata = await UserInterface.promptAI(prompt);
        return JSON.parse(metadata);
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
