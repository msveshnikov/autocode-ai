import inquirer from "inquirer";
import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import CodeGenerator from "./codeGenerator.js";
import DocumentationGenerator from "./documentationGenerator.js";
import path from "path";

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
                "🌐 12. Handle multi-language project",
                "🤖 13. Run AI Agents",
                "🔒 14. Security analysis",
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
            choices: ["JavaScript", "Python", "C#"],
        });
    },

    async chatInterface(readme, projectStructure) {
        const { input } = await inquirer.prompt({
            type: "input",
            name: "input",
            message: "Enter your suggestion (or 'exit' to quit):",
        });

        if (input.toLowerCase() === "exit") {
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
    You are CodeCraftAI, an automatic coding assistant. The user has made the following suggestion:
    
    ${input}
    
    For the file: ${selectedFile}
    
    Current file content:
    ${fileContent}
    
    README.md content:
    ${readme}
    
    Project structure:
    ${JSON.stringify(projectStructure, null, 2)}
    
    Please provide a response to help implement the user's suggestion in the selected file. 
    Provide specific instructions or code snippets as needed. Consider the current project structure 
    and README content when providing suggestions or solutions.
    `;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        console.log(chalk.cyan("🤖 CodeCraftAI:"), response.content[0].text);

        const codeSnippet = this.extractCodeSnippet(response.content[0].text);

        if (codeSnippet) {
            console.log(chalk.yellow("Extracted code snippet:"));
            console.log(chalk.yellow(codeSnippet));

            const { confirmChanges } = await inquirer.prompt({
                type: "confirm",
                name: "confirmChanges",
                message: "Would you like to apply these changes to the file?",
                default: false,
            });

            if (confirmChanges) {
                await FileManager.write(filePath, codeSnippet);
                console.log(chalk.green(`✅ ${selectedFile} has been updated with the extracted code snippet.`));
            }
        } else {
            console.log(chalk.red("No code snippet found in the response."));
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
    },

    async processFiles(files, readme, projectStructure) {
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
    },
    async handleAction(action, readme, readmePath, projectStructure) {
        let continueExecution = true;
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
                await this.processFiles(selectedFiles, readme, projectStructure);
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
            case "🔒 13. Security analysis":
                {
                    const filesToAnalyze = await FileManager.getFilesToProcess();
                    const { selectedFiles } = await UserInterface.promptForFiles(filesToAnalyze);
                    for (const file of selectedFiles) {
                        await CodeAnalyzer.checkSecurityVulnerabilities(file);
                    }
                }
                break;
            case "🚪 Exit":
                console.log(chalk.yellow("👋 Thanks for using CodeCraftAI. See you next time!"));
                continueExecution = false;
                break;
        }
        return continueExecution;
    },
};

export default UserInterface;
