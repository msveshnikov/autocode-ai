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
import fs from "fs/promises";
import os from "os";

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
                "🌐 16. Generate landing page",
                "📊 17. Generate API documentation",
                "🔄 18. Generate full project",
                "🕒 19. Handle long-running tasks",
                "🏖️ 20. Generate sandbox environment",
                "🔄 21. Generate iterative development workflow",
                "🌡️ Change temperature",
                "🔑 Login",
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
            choices: Object.keys(CONFIG.languageConfigs),
        });
    },

    async promptForTemperature() {
        return inquirer.prompt({
            type: "list",
            name: "temperature",
            message: "Select the temperature for AI generation:",
            choices: CONFIG.temperatureOptions.map(String),
        });
    },

    async promptForLogin() {
        return inquirer.prompt([
            {
                type: "input",
                name: "email",
                message: "Enter your email:",
            },
            {
                type: "password",
                name: "password",
                message: "Enter your password:",
            },
        ]);
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
                temperature: await this.getTemperature(),
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

    async runAIAgents(projectStructure, readme) {
        console.log(chalk.cyan("🤖 Running AI Agents..."));
        // eslint-disable-next-line no-unused-vars
        for (const [agentKey, agentConfig] of Object.entries(CONFIG.aiAgents)) {
            console.log(chalk.yellow(`Running ${agentConfig.name}...`));
            await CodeGenerator[`run${agentConfig.name.replace(/\s+/g, "")}Agent`](projectStructure, readme);
        }
        console.log(chalk.green("✅ All AI Agents have completed their tasks."));
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
                await this.runAIAgents(projectStructure, readme);
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
            case "🌐 16. Generate landing page":
                await CodeGenerator.generateLandingPage(projectStructure);
                break;
            case "📊 17. Generate API documentation":
                await DocumentationGenerator.generateAPIDocumentation(projectStructure);
                break;
            case "🔄 18. Generate full project":
                await CodeGenerator.generateFullProject(readme, projectStructure);
                break;
            case "🕒 19. Handle long-running tasks":
                await CodeGenerator.handleLongRunningTasks(projectStructure);
                break;
            case "🏖️ 20. Generate sandbox environment":
                await CodeGenerator.generateSandboxEnvironment(projectStructure);
                break;
            case "🔄 21. Generate iterative development workflow":
                await CodeGenerator.generateIterativeDevelopmentWorkflow(projectStructure);
                break;
            case "🌡️ Change temperature":
                await this.setTemperature();
                break;
            case "🔑 Login":
                await this.handleLogin();
                break;
            case "🚪 Exit":
                console.log(chalk.yellow("👋 Thanks for using AutoCode. See you next time!"));
                continueExecution = false;
                break;
        }
        return continueExecution;
    },

    async getTemperature() {
        try {
            const temperatureData = await fs.readFile(path.join(process.cwd(), ".temperature.json"), "utf8");
            const { temperature } = JSON.parse(temperatureData);
            return temperature || 0.7;
        } catch {
            return 0.7;
        }
    },

    async setTemperature() {
        const { temperature } = await this.promptForTemperature();
        await FileManager.write(
            path.join(os.homedir(), ".temperature.json"),
            JSON.stringify({ temperature: parseFloat(temperature) }, null, 2)
        );
        console.log(chalk.green(`Temperature set to ${temperature}`));
    },

    async handleLogin() {
        console.log(chalk.cyan("Please visit https://autocode.work to register if you haven't already."));
        const { email, password } = await this.promptForLogin();
        const loggedIn = await LicenseManager.login(email, password);
        if (loggedIn) {
            console.log(chalk.green("Login successful!"));
            return true;
        } else {
            console.log(chalk.red("Login failed. Please try again."));
            return false;
        }
    },
};

export default UserInterface;
