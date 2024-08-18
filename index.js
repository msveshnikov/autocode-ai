#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import inquirer from "inquirer";
import { exec } from "child_process";
import { promisify } from "util";
import ignore from "ignore";

const CONFIG = {
    excludedFiles: ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"],
    excludedDirs: [".git", "node_modules"],
    excludedExtensions: [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"],
    anthropicModel: "claude-3-5-sonnet-20240620",
    maxTokens: 8192,
    maxFileLines: 500,
};

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });
const execAsync = promisify(exec);

const FileManager = {
    async read(filePath) {
        try {
            return await fs.readFile(filePath, "utf8");
        } catch (error) {
            console.error(chalk.red(`Error reading file ${filePath}:`), error);
            return null;
        }
    },

    async write(filePath, content) {
        try {
            await fs.writeFile(filePath, content, "utf8");
            console.log(chalk.green(`✅ File ${filePath} has been updated.`));
        } catch (error) {
            console.error(chalk.red(`❌ Error writing file ${filePath}:`), error);
        }
    },

    async createSubfolders(filePath) {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
    },

    async getFilesToProcess() {
        const gitignorePath = path.join(process.cwd(), ".gitignore");
        const gitignoreContent = (await this.read(gitignorePath)) || "";
        const ig = ignore().add(gitignoreContent);
        const files = await fs.readdir(process.cwd(), { withFileTypes: true, recursive: true });
        return files
            .filter((file) => {
                const relativePath = path.relative(process.cwd(), path.join(file.path, file.name));
                return (
                    file.isFile() &&
                    !ig.ignores(relativePath) &&
                    !CONFIG.excludedFiles.includes(file.name) &&
                    !CONFIG.excludedDirs.some((dir) => relativePath.startsWith(dir)) &&
                    !CONFIG.excludedExtensions.includes(path.extname(file.name).toLowerCase())
                );
            })
            .map((file) => path.relative(process.cwd(), path.join(file.path, file.name)));
    },

    async getProjectStructure() {
        const files = await this.getFilesToProcess();
        return files.reduce((acc, file) => {
            const parts = file.split(path.sep);
            let current = acc;
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    current[part] = null;
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            });
            return acc;
        }, {});
    },
};

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
};

const CodeAnalyzer = {
    async runLintChecks(filePath) {
        console.log(chalk.cyan(`🔍 Running code quality checks for ${filePath}...`));
        try {
            const { stdout, stderr } = await execAsync(`npx eslint ${filePath}`, { encoding: "utf8" });
            if (stdout) console.log(chalk.yellow(`⚠️ ESLint warnings:\n${stdout}`));
            if (stderr) console.error(chalk.red(`❌ ESLint errors:\n${stderr}`));
            if (!stdout && !stderr) console.log(chalk.green(`✅ ESLint passed for ${filePath}`));
            return stdout || stderr;
        } catch (error) {
            console.error(chalk.red(`❌ Error running ESLint: ${error.message}`));
            return error.stdout || error.stderr || error.message;
        }
    },

    async fixLintErrors(filePath, lintOutput, projectStructure) {
        console.log(chalk.yellow(`🔧 Attempting to fix lint errors for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const prompt = `
Please fix the following ESLint errors in the file ${filePath}:

${lintOutput}

Current file content:
${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide the corrected code that addresses all the ESLint errors. Consider the project structure when making changes. Do not include any explanations or comments in your response, just provide the code.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write(filePath, response.content[0].text);
        console.log(chalk.green(`✅ Lint errors fixed for ${filePath}`));
    },

    async optimizeProjectStructure(projectStructure) {
        console.log(chalk.cyan("🔧 Optimizing project structure..."));

        const prompt = `
Analyze the following project structure and provide optimization suggestions:

${JSON.stringify(projectStructure, null, 2)}

Please provide suggestions for optimizing the project structure, including:
1. Reorganizing files and folders
2. Splitting or merging modules
3. Improving naming conventions
4. Enhancing overall project architecture

Provide the suggestions in a structured format.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        console.log(chalk.green("📊 Project structure optimization suggestions:"));
        console.log(response.content[0].text);
    },
};

const DocumentationGenerator = {
    async generate(filePath, content, projectStructure) {
        console.log(chalk.cyan(`📝 Generating documentation for ${filePath}...`));
        const docFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.md`);

        const prompt = `
Generate documentation for the following code file:

File: ${filePath}

Content:
${content}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide comprehensive documentation for the code above. Include an overview, function/method descriptions, parameters, return values, and usage examples where applicable. Consider the project structure when describing the file's role in the overall project. Format the documentation in Markdown.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write(docFilePath, response.content[0].text);
        console.log(chalk.green(`✅ Documentation generated for ${filePath}`));
    },
};

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

async function processFiles(files, readme, projectStructure) {
    for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        console.log(chalk.cyan(`🔧 Processing ${file}...`));
        const currentContent = await FileManager.read(filePath);
        const generatedContent = await CodeGenerator.generate(readme, currentContent, file, projectStructure);
        await FileManager.write(filePath, generatedContent);

        if (generatedContent.split("\n").length > CONFIG.maxFileLines) {
            await splitLargeFile(filePath, generatedContent, projectStructure);
        }
    }
}

async function splitLargeFile(filePath, content, projectStructure) {
    console.log(chalk.yellow(`📂 File ${filePath} exceeds ${CONFIG.maxFileLines} lines. Splitting...`));

    const prompt = `
The file ${filePath} exceeds ${CONFIG.maxFileLines} lines. Please suggest how to split this file into smaller, more manageable parts. Consider the following:

1. Identify logical components or functionalities that can be separated.
2. Suggest new file names for the extracted parts.
3. Provide the content for each new file, including the updated content for the original file.
4. Ensure that the split maintains the overall functionality and doesn't break any dependencies.

Current file content:
${content}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide your suggestions in a structured format, including the new file names and their contents.
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
        // Implement the file split based on the AI suggestion
        // This part would require parsing the AI's response and creating new files accordingly
        console.log(chalk.green("✅ File split completed."));
    } else {
        console.log(chalk.yellow("⏹️ File split cancelled."));
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