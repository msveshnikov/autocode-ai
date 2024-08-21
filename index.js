#!/usr/bin/env node

import path from "path";
import chalk from "chalk";

import FileManager from "./fileManager.js";
import UserInterface from "./userInterface.js";
import LicenseManager from "./licenseManager.js";

async function checkLicense() {
    const isValid = await LicenseManager.checkLicense();
    if (!isValid) {
        console.log(chalk.red("Invalid or expired license. Please upgrade or renew your subscription."));
        return false;
    }
    return true;
}

async function main() {
    console.log(chalk.blue("👋 Welcome to AutoCode!"));
    if (!process.env.CLAUDE_KEY) {
        console.log(chalk.red("Please set up CLAUDE_KEY variable"));
        return;
    }

    if (!(await checkLicense())) {
        return;
    }

    const readmePath = path.join(process.cwd(), "README.md");
    let readme = await FileManager.read(readmePath);
    if (!readme) {
        console.error(chalk.red("❌ README.md not found or unable to read."));
        return;
    }

    let continueExecution = true;
    while (continueExecution) {
        if (!(await checkLicense())) {
            break;
        }
        const projectStructure = await FileManager.getProjectStructure();
        const { action } = await UserInterface.promptForAction();
        continueExecution = await UserInterface.handleAction(action, readme, readmePath, projectStructure);
    }
}

main().catch((error) => {
    console.error(chalk.red("❌ An error occurred:"), error.message);
});
