#!/usr/bin/env node

import path from "path";
import chalk from "chalk";

import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import DocumentationGenerator from "./documentationGenerator.js";
import UserInterface from "./userInterface.js";

async function processFiles(files, readme, projectStructure) {
    for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        console.log(chalk.cyan(`🔧 Processing ${file}...`));
        const currentContent = await FileManager.read(filePath);
        const generatedContent = await CodeGenerator.generate(readme, currentContent, file, projectStructure);
        await FileManager.write(filePath, generatedContent);

        if (generatedContent.split("\n").length > CONFIG.maxFileLines) {
            await CodeGenerator.splitLargeFile(filePath, generatedContent, projectStructure);
        }
    }
}

async function main() {
    console.log(chalk.blue("👋 Welcome to CodeCraftAI!"));
    if (!process.env.CLAUDE_KEY) {
        console.log(chalk.red("Please set up CLAUDE_KEY variable"));
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
        const projectStructure = await FileManager.getProjectStructure();
        const { action } = await UserInterface.promptForAction();

        switch (action) {
            case "📝 1. Brainstorm README.md": {
                console.log(chalk.cyan("📝 Updating README.md with new design ideas and considerations..."));
                const updatedReadme = await CodeGenerator.updateReadme(readme, projectStructure);
                await FileManager.write(readmePath, updatedReadme);
                readme = updatedReadme;
                break;
            }
            case "🔧 2. Generate code": {
                const filesToProcess = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToProcess);
                await processFiles(selectedFiles, readme, projectStructure);
                console.log(chalk.green("\n✅ CodeCraftAI has successfully generated/updated your project files."));
                break;
            }
            case "🔍 3. Detect missing dependencies":
                await CodeAnalyzer.detectMissingDependencies(projectStructure);
                break;
            case "🚀 4. Run static code quality checks": {
                const filesToCheck = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToCheck);
                for (const file of selectedFiles) {
                    if (file.includes("package.json")) continue;
                    const lintOutput = await CodeAnalyzer.runLintChecks(file);
                    if (lintOutput) {
                        await CodeAnalyzer.fixLintErrors(file, lintOutput, projectStructure);
                        await CodeAnalyzer.createMissingFilesFromLint(lintOutput, projectStructure);
                    }
                }
                break;
            }
            case "📚 5. Generate documentation": {
                const filesToDocument = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToDocument);
                for (const file of selectedFiles) {
                    const content = await FileManager.read(file);
                    await DocumentationGenerator.generate(file, content, projectStructure);
                }
                break;
            }
            case "🔄 6. Optimize and refactor file": {
                const filesToOptimize = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToOptimize);
                for (const file of selectedFiles) {
                    await CodeGenerator.optimizeAndRefactorFile(file, projectStructure);
                }
                break;
            }
            case "💬 7. Chat interface": {
                let chatContinue = true;
                while (chatContinue) {
                    const result = await UserInterface.chatInterface(readme, projectStructure);
                    chatContinue = result.continue;
                    readme = result.updatedReadme;
                }
                break;
            }
            case "📚 Generate project documentation":
                await DocumentationGenerator.generateProjectDocumentation(projectStructure);
                break;
            case "🤔 Analyze code quality": {
                const filesToOptimize = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToOptimize);
                for (const file of selectedFiles) {
                    await CodeAnalyzer.analyzeCodeQuality(file);
                }
                break;
            }
            case "🔍 Optimize project structure":
                await CodeAnalyzer.optimizeProjectStructure(projectStructure);
                break;
            case "➕ Add new file": {
                const { newFile } = await UserInterface.promptForNewFile();
                if (newFile) {
                    await CodeAnalyzer.addNewFile(path.join(process.cwd(), newFile));
                }
                break;
            }
            case "🚪 Exit":
                console.log(chalk.yellow("👋 Thanks for using CodeCraftAI. See you next time!"));
                continueExecution = false;
                break;
        }
    }
}

main().catch((error) => {
    console.error(chalk.red("❌ An error occurred:"), error.message);
});
