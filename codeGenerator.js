import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import chalk from "chalk";
import inquirer from "inquirer";
import path from "path";
import FileManager from "./fileManager.js";
import ora from "ora";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const CodeGenerator = {
    async generate(readme, currentCode, fileName, projectStructure) {
        const fileExtension = path.extname(fileName);
        const language = this.getLanguageFromExtension(fileExtension);
        const languageConfig = CONFIG.languageConfigs[language];

        const prompt = `
You are AutoCode, an automatic coding tool. Your task is to generate or update the ${fileName} file based on the README.md instructions, the current ${fileName} content (if any), and the project structure.

README.md content:
${readme}

Current ${fileName} content (if exists):
${currentCode || "No existing code"}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Language: ${language}
File extension: ${fileExtension}
Linter: ${languageConfig.linter}
Formatter: ${languageConfig.formatter}
Package manager: ${languageConfig.packageManager}

Please generate or update the ${fileName} file to implement the features described in the README. Ensure the code is complete, functional, and follows best practices for ${language}. Consider the project structure when making changes or adding new features. Reuse functionality from other modules and avoid duplicating code. Do not include any explanations or comments in your response, just provide the code.
`;

        const spinner = ora("Generating code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Code generated successfully");
            return response.content[0].text;
        } catch (error) {
            spinner.fail("Error generating code");
            throw error;
        }
    },

    async updateReadme(readme, projectStructure) {
        const prompt = `
You are AutoCode, an automatic coding tool. Your task is to update the README.md file with new design ideas and considerations based on the current content and project structure.

Current README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please update the README.md file with new design ideas and considerations. Ensure the content is well-structured and follows best practices. Consider the current project structure when suggesting improvements or new features. Include information about multi-language support and any new features or changes. Do not include any explanations or comments in your response, just provide the updated README.md content.
`;

        const spinner = ora("Updating README...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("README updated successfully");
            return response.content[0].text;
        } catch (error) {
            spinner.fail("Error updating README");
            throw error;
        }
    },

    async splitLargeFile(filePath, content, projectStructure) {
        console.log(chalk.yellow(`📂 File ${filePath} exceeds ${CONFIG.maxFileLines} lines. Splitting...`));

        const fileExtension = path.extname(filePath);
        const language = this.getLanguageFromExtension(fileExtension);

        const prompt = `
The file ${filePath} exceeds ${
            CONFIG.maxFileLines
        } lines. Please suggest how to split this file into smaller, more manageable parts. Consider the following:

1. Identify logical components or functionalities that can be separated.
2. Suggest new file names for the extracted parts.
3. Provide the content for each new file, including the updated content for the original file.
4. Ensure that the split maintains the overall functionality and doesn't break any dependencies.
5. Use appropriate language-specific conventions for ${language}.

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

        const spinner = ora("Generating file split suggestion...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("File split suggestion generated");

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
        } catch (error) {
            spinner.fail("Error generating file split suggestion");
            throw error;
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
            const filePath =
                fileName === path.basename(originalFilePath) ? originalFilePath : path.join(originalDir, fileName);
            await FileManager.write(filePath, content);
            console.log(chalk.green(`✅ Saved file: ${filePath}`));
        }
    },

    async optimizeAndRefactorFile(filePath, projectStructure) {
        console.log(chalk.cyan(`🔄 Optimizing and refactoring ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const fileExtension = path.extname(filePath);
        const language = this.getLanguageFromExtension(fileExtension);
        const languageConfig = CONFIG.languageConfigs[language];

        const prompt = `
Please optimize and refactor the following code from ${filePath}:

${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Language: ${language}
File extension: ${fileExtension}
Linter: ${languageConfig.linter}
Formatter: ${languageConfig.formatter}
Package manager: ${languageConfig.packageManager}

Focus on:
1. Improving code efficiency
2. Enhancing readability
3. Applying design patterns where appropriate
4. Reducing code duplication
5. Improving overall code structure
6. Ensuring consistency with the project structure
7. Reusing functionality from other modules
8. Following best practices and conventions for ${language}

Return the optimized and refactored code ONLY!! without explanations or comments or md formatting.
`;

        const spinner = ora("Optimizing and refactoring...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Optimization and refactoring completed");

            const optimizedCode = response.content[0].text;
            await FileManager.write(filePath, optimizedCode);
            console.log(chalk.green(`✅ ${filePath} has been optimized and refactored.`));
        } catch (error) {
            spinner.fail("Error optimizing and refactoring");
            throw error;
        }
    },

    getLanguageFromExtension(fileExtension) {
        for (const [language, config] of Object.entries(CONFIG.languageConfigs)) {
            if (config.fileExtensions.includes(fileExtension)) {
                return language;
            }
        }
        return "javascript";
    },

    async generateDependencyFile(language, projectStructure) {
        const languageConfig = CONFIG.languageConfigs[language];
        let dependencyFileName;

        switch (languageConfig.packageManager) {
            case "npm":
                dependencyFileName = "package.json";
                break;
            case "pip":
                dependencyFileName = "requirements.txt";
                break;
            case "nuget":
                dependencyFileName = "ProjectName.csproj";
                break;
            default:
                throw new Error(`Unsupported package manager: ${languageConfig.packageManager}`);
        }

        console.log(chalk.cyan(`📦 Generating ${dependencyFileName} for ${language}...`));

        const prompt = `
Please generate a ${dependencyFileName} file for a ${language} project with the following structure:

${JSON.stringify(projectStructure, null, 2)}

Include all necessary dependencies based on the project structure and features described in the README.md. Ensure the file is properly formatted and follows best practices for ${language} projects.

Return the content of the ${dependencyFileName} file ONLY!! without explanations or comments or md formatting.
`;

        const spinner = ora(`Generating ${dependencyFileName}...`).start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed(`${dependencyFileName} generated successfully`);

            const dependencyFileContent = response.content[0].text;
            await FileManager.write(dependencyFileName, dependencyFileContent);
            console.log(chalk.green(`✅ Generated ${dependencyFileName}`));
        } catch (error) {
            spinner.fail(`Error generating ${dependencyFileName}`);
            throw error;
        }
    },

    async generateAIAgentCode(agentType, projectStructure) {
        console.log(chalk.cyan(`🤖 Generating AI agent code for ${agentType}...`));

        const prompt = `
Please generate code for the ${agentType} AI agent based on the project structure and features described in the README.md. The agent should be able to perform its specific tasks as outlined in the README.

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the agent's functionality. Reuse existing modules and avoid duplicating code.

Return the generated code for the ${agentType} AI agent ONLY!! without explanations or comments or md formatting.
`;

        const spinner = ora(`Generating ${agentType} AI agent code...`).start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed(`${agentType} AI agent code generated successfully`);

            const agentCode = response.content[0].text;
            const fileName = `${agentType.toLowerCase().replace(/\s+/g, "")}Agent.js`;
            await FileManager.write(fileName, agentCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail(`Error generating ${agentType} AI agent code`);
            throw error;
        }
    },

    async generateWorkflowCode(projectStructure) {
        console.log(chalk.cyan(`🔄 Generating AI agent workflow code...`));

        const prompt = `
Please generate code for managing the workflow and interactions between AI agents based on the project structure and features described in the README.md. The workflow should orchestrate the actions of different AI agents and ensure smooth communication between them.

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the workflow. Reuse existing modules and avoid duplicating code.

Return the generated code for the AI agent workflow ONLY!! without explanations or comments or md formatting.
`;

        const spinner = ora("Generating AI agent workflow code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("AI agent workflow code generated successfully");

            const workflowCode = response.content[0].text;
            const fileName = "aiWorkflow.js";
            await FileManager.write(fileName, workflowCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail("Error generating AI agent workflow code");
            throw error;
        }
    },
};

export default CodeGenerator;