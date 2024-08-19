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
                "🔧 Process files",
                "➕ Add a new file",
                "📝 Update README.md",
                "🔍 Optimize project structure",
                "🚀 Run code quality checks",
                "📚 Generate documentation",
                "📚 Generate project documentation",
                "🔄 Optimize and refactor file",
                "💬 Chat interface",
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
            message: "Enter your request (or 'exit' to quit):",
        });

        if (input.toLowerCase() === "exit") {
            return { continue: false, updatedReadme: readme };
        }

        const prompt = `
You are CodeCraftAI, an automatic coding assistant. The user has made the following request:

${input}

Current README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide a response to help the user with their request. If it involves coding tasks, provide specific instructions or code snippets as needed. If the request implies a new feature or requirement, suggest an appropriate addition to the README.md file. Consider the current project structure when providing suggestions or solutions.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        console.log(chalk.cyan("🤖 CodeCraftAI:"), response.content[0].text);

        const { updateReadme } = await inquirer.prompt({
            type: "confirm",
            name: "updateReadme",
            message: "Would you like to update the README.md with this new requirement?",
            default: false,
        });

        if (updateReadme) {
            const updatedReadme = `${readme}\n\n## New Requirement\n\n${input}`;
            await FileManager.write(path.join(process.cwd(), "README.md"), updatedReadme);
            console.log(chalk.green("✅ README.md has been updated with the new requirement."));
            return { continue: true, updatedReadme };
        }

        return { continue: true, updatedReadme: readme };
    },
};

export default UserInterface;
