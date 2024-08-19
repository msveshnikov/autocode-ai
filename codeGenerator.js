import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const CodeGenerator = {
    async generate(readme, currentCode, fileName, projectStructure) {
        const prompt = `
You are CodeCraftAI, an automatic coding tool. Your task is to generate or update the ${fileName} file based on the README.md instructions, the current ${fileName} content (if any), and the project structure.

README.md content:
${readme}

Current ${fileName} content (if exists):
${currentCode || "No existing code"}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please generate or update the ${fileName} file to implement the features described in the README. Ensure the code is complete, functional, and follows best practices. Consider the project structure when making changes or adding new features. Do not include any explanations or comments in your response, just provide the code.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        return response.content[0].text;
    },

    async updateReadme(readme, projectStructure) {
        const prompt = `
You are CodeCraftAI, an automatic coding tool. Your task is to update the README.md file with new design ideas and considerations based on the current content and project structure.

Current README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please update the README.md file with new design ideas and considerations. Ensure the content is well-structured and follows best practices. Consider the current project structure when suggesting improvements or new features. Do not include any explanations or comments in your response, just provide the updated README.md content.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        return response.content[0].text;
    },

    async splitLargeFile(filePath, content, projectStructure) {
        console.log(chalk.yellow(`📂 File ${filePath} exceeds ${CONFIG.maxFileLines} lines. Splitting...`));

        const prompt = `
The file ${filePath} exceeds ${
            CONFIG.maxFileLines
        } lines. Please suggest how to split this file into smaller, more manageable parts. Consider the following:

1. Identify logical components or functionalities that can be separated.
2. Suggest new file names for the extracted parts.
3. Provide the content for each new file, including the updated content for the original file.
4. Ensure that the split maintains the overall functionality and doesn't break any dependencies.

Current file content:
${content}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide your suggestions in the following Markdown format:

# Original File: [original_file_name]
[content for the original file]

# New File: [new_file_name_1]
[content for new_file_1]

# New File: [new_file_name_2]
[content for new_file_2]

... (repeat for all new files)
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        const splitSuggestion = response.content[0].text;
        console.log(chalk.cyan("📋 File splitting suggestion:"));
        console.log(splitSuggestion);

        const { confirmSplit } = await inquirer.prompt({
            type: "confirm",
            name: "confirmSplit",
            message: "Do you want to proceed with the suggested file split?",
            default: true,
        });

        if (confirmSplit) {
            const files = this.parseSplitSuggestion(splitSuggestion);
            await this.saveFiles(filePath, files);
            console.log(chalk.green("✅ File split completed."));
        } else {
            console.log(chalk.yellow("⏹️ File split cancelled."));
        }
    },

    parseSplitSuggestion(suggestion) {
        const files = {};
        const fileRegex = /# (?:Original File|New File): (.+)\n([\s\S]+?)(?=\n# (?:Original File|New File)|$)/g;
        let match;

        while ((match = fileRegex.exec(suggestion)) !== null) {
            const [, fileName, content] = match;
            files[fileName.trim()] = content.trim();
        }

        return files;
    },

    async saveFiles(originalFilePath, files) {
        const originalDir = path.dirname(originalFilePath);

        for (const [fileName, content] of Object.entries(files)) {
            let filePath;
            if (fileName === path.basename(originalFilePath)) {
                filePath = originalFilePath;
            } else {
                filePath = path.join(originalDir, fileName);
            }

            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✅ Saved file: ${filePath}`));
        }
    },
};

export default CodeGenerator;
