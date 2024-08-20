import inquirer from "inquirer";
import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
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
                "🤔 Analyze code quality",
                "📚 Generate project documentation",
                "🔍 Optimize project structure",
                "➕ Add new file",
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
        const codeBlockRegex = /```(?:javascript|js)?\n([\s\S]*?)```/;
        const match = markdown.match(codeBlockRegex);
        return match ? match[1].trim() : null;
    },
};

export default UserInterface;
