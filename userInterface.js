import inquirer from "inquirer";
import chalk from "chalk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import CodeGenerator from "./codeGenerator.js";
import DocumentationGenerator from "./documentationGenerator.js";
import LicenseManager from "./licenseManager.js";
import ProjectManagerAgent from "./ProjectManagerAgent.js";
import DevOpsAgent from "./DevOpsAgent.js";
import InternationalizationAgent from "./InternationalizationAgent.js";
import TesterAgent from "./TesterAgent.js";
import MarketingAgent from "./MarketingAgent.js";
import BusinessAnalystAgent from "./BusinessAnalystAgent.js";
import ProductOwnerAgent from "./ProductOwnerAgent.js";
import AppStorePublisherAgent from "./AppStorePublisherAgent.js";
import path from "path";
import ora from "ora";
import fs from "fs/promises";
import os from "os";
import { getResponse } from "./model.js";

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
                "🌡️ Change temperature",
                "🤖 Change model",
                "🔑 Login",
                "🚪 Exit",
            ],
        });
    },

    async promptForModel() {
        const currentModel = await this.getModel();
        return inquirer.prompt({
            type: "list",
            name: "model",
            message: "Select model to use",
            default: currentModel,
            choices: [
                "claude-3-5-sonnet-20240620",
                "claude-3-5-sonnet-20241022",
                "claude-3-7-sonnet-20250219",
                "claude-3-5-haiku-latest",
                "deepseek-reasoner",
                "deepseek-chat",
                "o3-mini",
                "gemini-2.0-flash-thinking-exp-01-21",
            ],
        });
    },

    async setModel() {
        const { model } = await this.promptForModel();
        await FileManager.write(
            path.join(os.homedir(), ".settings.json"),
            JSON.stringify(
                {
                    model,
                    temperature: await this.getTemperature(),
                },
                null,
                2
            )
        );
        console.log(chalk.green(`Model set to ${model}`));
    },

    async getModel() {
        try {
            const settings = await fs.readFile(path.join(os.homedir(), ".settings.json"), "utf8");
            const { model } = JSON.parse(settings);
            return model || "claude-3-5-sonnet-20241022";
        } catch {
            return "claude-3-5-sonnet-20241022";
        }
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
        const currentTemperature = await this.getTemperature();
        return inquirer.prompt({
            type: "list",
            name: "temperature",
            message: "Select the temperature for AI generation",
            default: currentTemperature.toString(),
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

    async chatInterface(projectStructure, readme) {
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
            const response = await getResponse(prompt);
            spinner.succeed("AI request completed");
            await FileManager.write(filePath, CodeGenerator.cleanGeneratedCode(response.content[0].text));
            console.log(chalk.green(`✅ ${selectedFile} has been updated with the extracted code snippet.`));
            await CodeGenerator.calculateTokenStats(response.usage?.input_tokens, response.usage?.output_tokens);
        } catch (error) {
            spinner.fail("AI request failed");
            console.error(chalk.red(`Error: ${error.message}`));
        }

        return { continue: true, updatedReadme: readme };
    },

    async generateAIAgents(projectStructure, readme) {
        console.log(chalk.cyan("🤖 Generating AI Agents..."));
        // eslint-disable-next-line no-unused-vars
        for (const [agentKey, agentConfig] of Object.entries(CONFIG.aiAgents)) {
            console.log(chalk.yellow(`Generating ${agentConfig.name}...`));
            await CodeGenerator.generateAIAgentCode(
                agentConfig.name,
                agentConfig.description,
                projectStructure,
                readme
            );
        }
        console.log(chalk.green("✅ All AI Agents have completed their tasks."));
    },

    async runAIAgents(projectStructure, readme) {
        console.log(chalk.cyan("🤖 Running AI Agents..."));
        const agents = [
            { name: "Project Manager Agent", agent: ProjectManagerAgent },
            { name: "DevOps Agent", agent: DevOpsAgent },
            { name: "Internationalization Agent", agent: InternationalizationAgent },
            { name: "Tester Agent", agent: TesterAgent },
            { name: "Marketing Agent", agent: MarketingAgent },
            { name: "Business Analyst Agent", agent: BusinessAnalystAgent },
            { name: "Product Owner Agent", agent: ProductOwnerAgent },
            { name: "App Store Publisher Agent", agent: AppStorePublisherAgent },
        ];

        const { selectedAgent } = await inquirer.prompt({
            type: "list",
            name: "selectedAgent",
            message: "Select an AI Agent to run:",
            choices: agents.map((a) => a.name),
        });

        const agentToRun = agents.find((a) => a.name === selectedAgent);
        if (agentToRun) {
            console.log(chalk.yellow(`Running ${agentToRun.name}...`));
            await agentToRun.agent.run(projectStructure, readme);
            console.log(chalk.green(`✅ ${agentToRun.name} has completed its tasks.`));
        } else {
            console.log(chalk.red("Invalid agent selection."));
        }
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
                    const { confirm } = await inquirer.prompt({
                        type: "confirm",
                        name: "confirm",
                        message: `The generated file ${file} is large. Do you want to split it?`,
                        default: true,
                    });
                    if (confirm) {
                        await CodeGenerator.splitLargeFile(filePath, generatedContent, projectStructure);
                    }
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
                console.log(chalk.green("✅ AutoCode has successfully generated/updated your project files."));
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
                    const result = await UserInterface.chatInterface(projectStructure, readme);
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
                await CodeGenerator.generateLandingPage(projectStructure, readme);
                break;
            case "📊 17. Generate API documentation":
                await DocumentationGenerator.generateAPIDocumentation(projectStructure, readme);
                break;
            case "🔄 18. Generate full project":
                await CodeGenerator.generateFullProject(projectStructure, readme);
                break;
            case "🌡️ Change temperature":
                await this.setTemperature();
                break;
            case "🤖 Change model":
                await this.setModel();
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
            const settings = await fs.readFile(path.join(os.homedir(), ".settings.json"), "utf8");
            const { temperature } = JSON.parse(settings);
            return temperature || 0.7;
        } catch {
            return 0.7;
        }
    },

    async setTemperature() {
        const { temperature } = await this.promptForTemperature();
        const settings = {
            temperature: parseFloat(temperature),
            model: await this.getModel(),
        };
        await FileManager.write(path.join(os.homedir(), ".settings.json"), JSON.stringify(settings, null, 2));
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
