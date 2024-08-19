#!/usr/bin/env node

import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import inquirer from "inquirer";

import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import DocumentationGenerator from "./documentationGenerator.js";
import UserInterface from "./userInterface.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

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

async function addNewFile(filePath) {
    console.log(chalk.cyan(`➕ Adding new file: ${filePath}`));
    await FileManager.createSubfolders(filePath);
    await FileManager.write(filePath, "");
    console.log(chalk.green(`✅ New file ${filePath} has been created.`));
}

async function createMissingFiles(lintOutput, projectStructure) {
    const missingFileRegex = /Cannot find module '(.+?)'/g;
    const missingFiles = [...lintOutput.matchAll(missingFileRegex)].map((match) => match[1]);

    for (const file of missingFiles) {
        const filePath = path.join(process.cwd(), `${file}.js`);
        const { createFile } = await inquirer.prompt({
            type: "confirm",
            name: "createFile",
            message: `Do you want to create the missing file: ${filePath}?`,
            default: true,
        });

        if (createFile) {
            await addNewFile(filePath);
            console.log(chalk.green(`✅ Created missing file: ${filePath}`));
            const generatedContent = await CodeGenerator.generate("", "", filePath, projectStructure);
            await FileManager.write(filePath, generatedContent);
        }
    }
}

async function optimizeAndRefactorFile(filePath, projectStructure) {
    console.log(chalk.cyan(`🔄 Optimizing and refactoring ${filePath}...`));
    const fileContent = await FileManager.read(filePath);
    const prompt = `
Please optimize and refactor the following code from ${filePath}:

${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Focus on:
1. Improving code efficiency
2. Enhancing readability
3. Applying design patterns where appropriate
4. Reducing code duplication
5. Improving overall code structure
6. Ensuring consistency with the project structure

Provide the optimized and refactored code without explanations.
`;

    const response = await anthropic.messages.create({
        model: CONFIG.anthropicModel,
        max_tokens: CONFIG.maxTokens,
        messages: [{ role: "user", content: prompt }],
    });

    await FileManager.write(filePath, response.content[0].text);
    console.log(chalk.green(`✅ ${filePath} has been optimized and refactored.`));
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
            case "🔧 Process files": {
                const filesToProcess = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToProcess);
                await processFiles(selectedFiles, readme, projectStructure);
                console.log(chalk.green("\n✅ CodeCraftAI has successfully generated/updated your project files."));
                break;
            }
            case "➕ Add a new file": {
                const { newFile } = await UserInterface.promptForNewFile();
                if (newFile) {
                    await addNewFile(path.join(process.cwd(), newFile));
                }
                break;
            }
            case "📝 Update README.md": {
                console.log(chalk.cyan("📝 Updating README.md with new design ideas and considerations..."));
                const updatedReadme = await CodeGenerator.updateReadme(readme, projectStructure);
                await FileManager.write(readmePath, updatedReadme);
                readme = updatedReadme;
                break;
            }
            case "🔍 Optimize project structure":
                await CodeAnalyzer.optimizeProjectStructure(projectStructure);
                break;
            case "🚀 Run code quality checks": {
                const filesToCheck = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToCheck);
                for (const file of selectedFiles) {
                    if (file.includes("package.json")) continue;
                    const lintOutput = await CodeAnalyzer.runLintChecks(file);
                    await CodeAnalyzer.fixLintErrors(file, lintOutput, projectStructure);
                    await createMissingFiles(lintOutput, projectStructure);
                }
                break;
            }
            case "📚 Generate project documentation":
                await DocumentationGenerator.generateProjectDocumentation(projectStructure);
                break;

            case "📚 Generate documentation": {
                const filesToDocument = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToDocument);
                for (const file of selectedFiles) {
                    const content = await FileManager.read(file);
                    await DocumentationGenerator.generate(file, content, projectStructure);
                }
                break;
            }
            case "💬 Chat interface": {
                let chatContinue = true;
                while (chatContinue) {
                    const result = await UserInterface.chatInterface(readme, projectStructure);
                    chatContinue = result.continue;
                    readme = result.updatedReadme;
                }
                break;
            }
            case "🔄 Optimize and refactor file": {
                const filesToOptimize = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToOptimize);
                for (const file of selectedFiles) {
                    await optimizeAndRefactorFile(file, projectStructure);
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
