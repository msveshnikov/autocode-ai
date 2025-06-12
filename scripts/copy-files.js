// scripts/copy-files.js

import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// --- Boilerplate to get __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---

const sourceDir = path.resolve(__dirname, "..");
const targetDir = path.resolve(__dirname, "..", "dist");

// Define our list of top-level directories/files to exclude
const topLevelExclusions = new Set([
    "node_modules",
    "server",
    "dist",
    ".github",
    // "docs",
    "scripts",
    ".git",
    ".gitignore",
    // Add any other top-level files/folders you want to exclude
]);

// A filter to be used *inside* the directories we DO copy
// This will exclude things like .csv files from any subdirectory
const contentFilter = (src) => {
    if (path.extname(src) === ".csv") {
        return false; // Exclude .csv files
    }
    return true; // Include everything else
};

async function run() {
    try {
        console.log("Starting build process...");

        // 1. Ensure the target directory is clean
        await fse.emptyDir(targetDir);
        console.log("Cleaned the /dist directory.");

        // 2. Get all items from the project's root directory
        const items = await fse.readdir(sourceDir);

        // 3. Loop over each item and copy it if it's not excluded
        for (const item of items) {
            if (topLevelExclusions.has(item)) {
                continue; // Skip this item
            }

            const sourceItemPath = path.join(sourceDir, item);
            const targetItemPath = path.join(targetDir, item);

            // Copy the item, applying the content filter for its children
            await fse.copy(sourceItemPath, targetItemPath, { filter: contentFilter });
        }

        console.log("✅ Files copied successfully to /dist without obfuscation!");
    } catch (err) {
        console.error("❌ An error occurred during the build process:", err);
        process.exit(1);
    }
}

// Execute the build process
run();
