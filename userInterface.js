import inquirer from "inquirer";
import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import CodeGenerator from "./codeGenerator.js";
import DocumentationGenerator from "./documentationGenerator.js";
import LicenseManager from "./licenseManager.js";
import path from "path";
import ora from "ora";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const UserInterface = {
    async promptForAction() {
        return inquirer.prompt({
            type: "list",
            name: "action",
            message: "What would you like to do next?",
            choices: [
                "📝 1. Brainstorm README.md",
                "🔧 2. Generate code",
                "🔍 3. Detect missing dependencies",
                "🚀 4. Run static code quality checks",
                "📚 5. Generate documentation",
                "🔄 6. Optimize and refactor file",
                "💬 7. Chat interface",
                "📚 8. Generate project documentation",
                "🤔 9. Analyze code quality",
                "🔍 10. Optimize project structure",
                "➕ 11. Add new file",
                "🤖 12. Run AI Agents",
                "🔒 13. Security analysis",
                "🧪 14. Generate unit tests",
                "🚀 15. Analyze performance",
                "🚪 Exit",
            ],
        });
    },

    async promptForFiles(files) {
        return inquirer.prompt({
            type: "checkbox",
            name: "selectedFiles",
            message: "Select files for processing:",
            choices: files,
        });
    },

    async promptForNewFile() {
        return inquirer.prompt({
            type: "input",
            name: "newFile",
            message: "Enter the name of the new file to create (include path if in subfolder):",
        });
    },

    async promptForLanguage() {
        return inquirer.prompt({
            type: "list",
            name: "language",
            message: "Select the programming language:",
            choices: ["JavaScript", "Python", "C#", "Java", "Ruby", "Go", "Rust", "PHP", "Swift"],
        });
    },

    async promptForTemperature() {
        return inquirer.prompt({
            type: "list",
            name: "temperature",
            message: "Select the temperature for AI generation:",
            choices: ["0", "0.5", "0.7"],
        });
    },

    async chatInterface(readme, projectStructure) {
        const { input } = await inquirer.prompt({
            type: "input",
            name: "input",
            message: "Enter your suggestion (or 'Enter' to quit):",
        });

        if (input.toLowerCase() === "") {
            return { continue: false, updatedReadme: readme };
        }

        const filesToProcess = await FileManager.getFilesToProcess();
        const { selectedFile } = await inquirer.prompt({
            type: "list",
            name: "selectedFile",
            message: "Select a file to process with your suggestion:",
            choices: filesToProcess,
        });

        const filePath = path.join(process.cwd(), selectedFile);
        const fileContent = await FileManager.read(filePath);

        const prompt = `
    You are AutoCode, an automatic coding assistant. The user has made the following suggestion:
    
    ${input}
    
    For the file: ${selectedFile}
    
    Current file content:
    ${fileContent}
    
    README.md content:
    ${readme}
    
    Project structure:
    ${JSON.stringify(projectStructure, null, 2)}
    
    Please generate or update the ${selectedFile} file to implement the features described in the README. Ensure the code is complete, functional, and follows best practices. Consider the project structure when making changes or adding new features. Reuse functionality from other modules and avoid duplicating code. Do not include any explanations or comments in your response, just provide the code.
    `;

        const spinner = ora("Processing AI request...").start();
        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: parseFloat(await this.getTemperature()),
                messages: [{ role: "user", content: prompt }],
            });
            spinner.succeed("AI request completed");

            await FileManager.write(filePath, response.content[0].text);
            console.log(chalk.green(`✅ ${selectedFile} has been updated with the extracted code snippet.`));
        } catch (error) {
            spinner.fail("AI request failed");
            console.error(chalk.red(`Error: ${error.message}`));
        }

        return { continue: true, updatedReadme: readme };
    },

    extractCodeSnippet(markdown) {
        const codeBlockRegex = /```(?:javascript|js|python|py|csharp|cs)?\n([\s\S]*?)```/;
        const match = markdown.match(codeBlockRegex);
        return match ? match[1].trim() : null;
    },

    async runAIAgents(projectStructure) {
        console.log(chalk.cyan("🤖 Running AI Agents..."));
        await CodeGenerator.runSQLMigrationsAgent(projectStructure);
        await CodeGenerator.runServicesAgent(projectStructure);
        await CodeGenerator.runAPIRoutesAgent(projectStructure);
        await CodeGenerator.runTesterAgent(projectStructure);
        await CodeGenerator.runProjectManagerAgent(projectStructure);
        await CodeGenerator.runLandingPageAgent(projectStructure);
        await CodeGenerator.runRedditPromotionAgent(projectStructure);
        await CodeGenerator.runCodeReviewAgent(projectStructure);
        await CodeGenerator.runDevOpsAgent(projectStructure);
        await CodeGenerator.runSecurityAgent(projectStructure);
        await CodeGenerator.runPerformanceAgent(projectStructure);
        await CodeGenerator.runInternationalizationAgent(projectStructure);
    },

    async processFiles(files, readme, projectStructure) {
        const allFileContents = {};
        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            allFileContents[file] = await FileManager.read(filePath);
        }

        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            console.log(chalk.cyan(`🔧 Processing ${file}...`));
            const currentContent = allFileContents[file];
            const spinner = ora("Generating content...").start();
            try {
                const generatedContent = await CodeGenerator.generate(
                    readme,
                    currentContent,
                    file,
                    projectStructure,
                    allFileContents
                );
                spinner.succeed("Content generated");
                await FileManager.write(filePath, generatedContent);

                if (generatedContent.split("\n").length > CONFIG.maxFileLines) {
                    await CodeGenerator.splitLargeFile(filePath, generatedContent, projectStructure);
                }
            } catch (error) {
                spinner.fail("Content generation failed");
                console.error(chalk.red(`Error processing ${file}: ${error.message}`));
            }
        }
    },

    async handleAction(action, readme, readmePath, projectStructure) {
        let continueExecution = true;
        switch (action) {
            case "📝 1. Brainstorm README.md": {
                console.log(chalk.cyan("📝 Updating README.md with new design ideas and considerations..."));
                const spinner = ora("Generating updated README...").start();
                try {
                    const updatedReadme = await CodeGenerator.updateReadme(readme, projectStructure);
                    spinner.succeed("README updated");
                    await FileManager.write(readmePath, updatedReadme);
                    readme = updatedReadme;
                } catch (error) {
                    spinner.fail("README update failed");
                    console.error(chalk.red(`Error: ${error.message}`));
                }
                break;
            }
            case "🔧 2. Generate code": {
                const filesToProcess = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToProcess);
                await this.processFiles(selectedFiles, readme, projectStructure);
                console.log(chalk.green("\n✅ AutoCode has successfully generated/updated your project files."));
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
            case "📚 8. Generate project documentation":
                await DocumentationGenerator.generateProjectDocumentation(projectStructure);
                break;
            case "🤔 9. Analyze code quality": {
                const filesToAnalyze = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToAnalyze);
                for (const file of selectedFiles) {
                    await CodeAnalyzer.analyzeCodeQuality(file);
                }
                break;
            }
            case "🔍 10. Optimize project structure":
                await CodeAnalyzer.optimizeProjectStructure(projectStructure);
                break;
            case "➕ 11. Add new file": {
                const { newFile } = await UserInterface.promptForNewFile();
                if (newFile) {
                    await CodeAnalyzer.addNewFile(path.join(process.cwd(), newFile));
                }
                break;
            }
            case "🤖 12. Run AI Agents":
                await this.runAIAgents(projectStructure);
                break;
            case "🔒 13. Security analysis": {
                const filesToAnalyze = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToAnalyze);
                for (const file of selectedFiles) {
                    await CodeAnalyzer.checkSecurityVulnerabilities(file);
                }
                break;
            }
            case "🧪 14. Generate unit tests": {
                const filesToTest = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToTest);
                for (const file of selectedFiles) {
                    await CodeAnalyzer.generateUnitTests(file, projectStructure);
                }
                break;
            }
            case "🚀 15. Analyze performance": {
                const filesToAnalyze = await FileManager.getFilesToProcess();
                const { selectedFiles } = await UserInterface.promptForFiles(filesToAnalyze);
                for (const file of selectedFiles) {
                    await CodeAnalyzer.analyzePerformance(file);
                }
                break;
            }
            case "🚪 Exit":
                console.log(chalk.yellow("👋 Thanks for using AutoCode. See you next time!"));
                continueExecution = false;
                break;
        }
        return continueExecution;
    },

    async getTemperature() {
        try {
            const temperatureData = await FileManager.read(path.join(process.cwd(), "temperature.json"));
            const { temperature } = JSON.parse(temperatureData);
            return temperature;
        } catch (error) {
            const { temperature } = await this.promptForTemperature();
            await FileManager.write(
                path.join(process.cwd(), "temperature.json"),
                JSON.stringify({ temperature }, null, 2)
            );
            return temperature;
        }
    },

    async checkLicenseAndDecrement() {
        const isValid = await LicenseManager.checkLicense();
        if (!isValid) {
            console.log(chalk.red("❌ Your license is not valid or has expired."));
            return false;
        }

        const remainingRequests = LicenseManager.getRemainingRequests();
        if (remainingRequests <= 0) {
            console.log(chalk.red("❌ You have reached your daily request limit."));
            return false;
        }

        await LicenseManager.decrementRequests();
        return true;
    },
};

export default UserInterface;
