#!/usr/bin/env node

import path from "path";
import chalk from "chalk";

import FileManager from "./fileManager.js";
import UserInterface from "./userInterface.js";
import CodeGenerator from "./codeGenerator.js";

async function runAutomatedMode(model, apiKey) {
    try {
        console.log(chalk.blue("🚀 Running in automated mode..."));
        const readmePath = path.join(process.cwd(), "README.md");
        let readme = await FileManager.read(readmePath);
        if (!readme) {
            console.error(chalk.red("❌ README.md not found or unable to read."));
            process.exit(1);
        }

        console.log(chalk.cyan("📝 Brainstorming README.md..."));
        const projectStructure = await FileManager.getProjectStructure();
        const updatedReadme = await CodeGenerator.updateReadme(readme, projectStructure, model, apiKey);
        await FileManager.write(readmePath, updatedReadme);
        readme = updatedReadme;
        console.log(chalk.green("✅ README.md brainstorming complete."));

        console.log(chalk.cyan("🔧 Generating code for all files..."));
        const filesToProcess = await FileManager.getFilesToProcess();
        await UserInterface.processFiles(filesToProcess, readme, projectStructure, model, apiKey);
        console.log(chalk.green("✅ Code generation for all files complete."));

        console.log(chalk.green("🎉 Automated mode completed successfully!"));
        process.exit(0);
    } catch (error) {
        console.error(chalk.red("❌ Error occured:"), error.message);
        process.exit(1);
    }
}

async function main() {
    console.log(chalk.blue("👋 Welcome to AutoCode!"));

    const args = process.argv.slice(2);

    if (args.length === 3 && args[0] === "generate") {
        const model = args[1];
        const apiKey = args[2];
        await runAutomatedMode(model, apiKey);
        return; // Exit after automated run
    }

    let continueExecution = true;
    while (continueExecution) {
        const readmePath = path.join(process.cwd(), "README.md");
        let readme = await FileManager.read(readmePath);
        if (!readme) {
            console.error(chalk.red("❌ README.md not found or unable to read."));
            process.exit(1);
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
