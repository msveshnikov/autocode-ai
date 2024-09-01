#!/usr/bin/env node

import path from "path";
import chalk from "chalk";

import FileManager from "./fileManager.js";
import UserInterface from "./userInterface.js";
import LicenseManager from "./licenseManager.js";

async function main() {
    console.log(chalk.blue("👋 Welcome to AutoCode!"));
    if (!process.env.CLAUDE_KEY) {
        console.log(chalk.red("Please set up CLAUDE_KEY environment variable"));
        return;
    }

    let continueExecution = true;
    while (continueExecution) {
        const readmePath = path.join(process.cwd(), "README.md");
        let readme = await FileManager.read(readmePath);
        if (!readme) {
            console.error(chalk.red("❌ README.md not found or unable to read."));
            return;
        }
        if (!(await LicenseManager.checkLicense())) {
            break;
        }
        const projectStructure = await FileManager.getProjectStructure();
        const { action } = await UserInterface.promptForAction();
        readme = await FileManager.read(readmePath);
        continueExecution = await UserInterface.handleAction(action, readme, readmePath, projectStructure);
    }
}

main().catch((error) => {
    console.error(chalk.red("❌ An error occurred:"), error.message);
});
