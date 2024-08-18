#!/usr/bin/env node
/* eslint-disable no-case-declarations */

import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import inquirer from "inquirer";
import { exec } from "child_process";
import { promisify } from "util";
import ignore from "ignore";

const excludedFiles = ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"];
const excludedDirs = [".git", "node_modules"];
const excludedExtensions = [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"];

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_KEY,
});

const execAsync = promisify(exec);

async function readFile(filePath) {
    try {
        return await fs.readFile(filePath, "utf8");
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

async function writeFile(filePath, content) {
    try {
        await fs.writeFile(filePath, content, "utf8");
        console.log(chalk.green(`File ${filePath} has been updated.`));
    } catch (error) {
        console.error(chalk.red(`Error writing file ${filePath}:`), error);
    }
}

async function generateCode(readme, currentCode, fileName) {
    const prompt = `
You are CodeCraftAI, an automatic coding tool. Your task is to generate or update the ${fileName} file based on the README.md instructions and the current ${fileName} content (if any).

README.md content:
${readme}

Current ${fileName} content (if exists):
${currentCode || "No existing code"}

Please generate or update the ${fileName} file to implement the features described in the README. Ensure the code is complete, functional, and follows best practices. Use ES6 imports and async/await syntax. Do not include any explanations or comments in your response, just provide the code.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].text;
}

async function createOrUpdateFile(filePath, content) {
    try {
        await fs.writeFile(filePath, content, "utf8");
        console.log(chalk.green(`File ${filePath} has been created/updated.`));
    } catch (error) {
        console.error(chalk.red(`Error creating/updating file ${filePath}:`), error);
    }
}

async function processFiles(files, readme) {
    for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        console.log(chalk.cyan(`Processing ${file}...`));
        const currentContent = await readFile(filePath);
        const generatedContent = await generateCode(readme, currentContent, file);
        await createOrUpdateFile(filePath, generatedContent);
    }
}

async function updateReadme(readme) {
    const prompt = `
You are CodeCraftAI, an automatic coding tool. Your task is to update the README.md file with new design ideas and considerations based on the current content.

Current README.md content:
${readme}

Please update the README.md file with new design ideas and considerations. Ensure the content is well-structured and follows best practices. Do not include any explanations or comments in your response, just provide the updated README.md content.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].text;
}

async function createSubfolders(filePath) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
}

async function runCodeQualityChecks(filePath) {
    try {
        console.log(chalk.cyan(`Running code quality checks for ${filePath}...`));
        const { stdout, stderr } = await execAsync(`npx eslint ${filePath}`);
        if (stderr) {
            console.error(chalk.red(`ESLint error: ${stderr}`));
            await fixLintErrors(filePath, stderr);
        } else {
            console.log(chalk.green(`ESLint passed for ${filePath}`));
        }
    } catch (error) {
        console.error(chalk.red(`Error running ESLint: ${error.message}`));
        await fixLintErrors(filePath, error.message);
    }
}

async function fixLintErrors(filePath, lintOutput) {
    console.log(chalk.yellow(`Attempting to fix lint errors for ${filePath}...`));
    console.log(chalk.yellow(`Lint output ${lintOutput}`));
    const fileContent = await readFile(filePath);
    const prompt = `
Please fix the following ESLint errors in the file ${filePath}:

${lintOutput}

Current file content:
${fileContent}

Please provide the corrected code that addresses all the ESLint errors. Do not include any explanations, just the corrected code.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    const correctedCode = response.content[0].text;
    await writeFile(filePath, correctedCode);
    console.log(chalk.green(`Lint errors fixed for ${filePath}`));
}

async function manageDependencies() {
    try {
        console.log(chalk.cyan("Checking and updating dependencies..."));
        const { stdout } = await execAsync("npm outdated --json");
        const outdatedDeps = JSON.parse(stdout);

        if (Object.keys(outdatedDeps).length > 0) {
            console.log(chalk.yellow("Outdated dependencies found. Updating..."));
            await execAsync("npm update");
            console.log(chalk.green("Dependencies updated successfully."));
        } else {
            console.log(chalk.green("All dependencies are up to date."));
        }
    } catch (error) {
        if (error.stderr && error.stderr.includes("No outdated dependencies")) {
            console.log(chalk.green("All dependencies are up to date."));
        } else {
            console.error(chalk.red(`Error managing dependencies: ${error.message}`));
        }
    }
}

async function getFilesToProcess() {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    let gitignoreContent = "";
    try {
        gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    } catch (error) {
        console.log(chalk.yellow("No .gitignore file found. Processing all files."));
    }

    const ig = ignore().add(gitignoreContent);

    const files = await fs.readdir(process.cwd(), { withFileTypes: true, recursive: true });
    const filesToProcess = files
        .filter((file) => {
            const relativePath = path.relative(process.cwd(), path.join(file.path, file.name));
            return (
                file.isFile() &&
                !ig.ignores(relativePath) &&
                !excludedFiles.includes(file.name) &&
                !excludedDirs.some((dir) => relativePath.startsWith(dir)) &&
                !excludedExtensions.includes(path.extname(file.name).toLowerCase())
            );
        })
        .map((file) => path.relative(process.cwd(), path.join(file.path, file.name)));

    return filesToProcess;
}

async function generateDocumentation(filePath, content) {
    console.log(chalk.cyan(`Generating documentation for ${filePath}...`));
    const docFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.md`);

    const prompt = `
Generate documentation for the following code file:

File: ${filePath}

Content:
${content}

Please provide comprehensive documentation for the code above. Include an overview, function/method descriptions, parameters, return values, and usage examples where applicable. Format the documentation in Markdown.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    await writeFile(docFilePath, response.content[0].text);
    console.log(chalk.green(`Documentation generated for ${filePath}`));
}

async function optimizeProjectStructure() {
    console.log(chalk.cyan("Optimizing project structure..."));
    const files = await getFilesToProcess();
    const structure = {};

    for (const file of files) {
        const parts = file.split(path.sep);
        let current = structure;
        for (const part of parts) {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
    }

    const optimizationSuggestions = await generateOptimizationSuggestions(structure);
    console.log(chalk.green("Project structure optimization suggestions:"));
    console.log(optimizationSuggestions);
}

async function generateOptimizationSuggestions(structure) {
    const prompt = `
Analyze the following project structure and provide optimization suggestions:

${JSON.stringify(structure, null, 2)}

Please provide suggestions for optimizing the project structure, including:
1. Reorganizing files and folders
2. Splitting or merging modules
3. Improving naming conventions
4. Enhancing overall project architecture

Provide the suggestions in a structured format.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].text;
}

async function detectSecurityVulnerabilities() {
    console.log(chalk.cyan("Detecting security vulnerabilities..."));
    try {
        const { stdout, stderr } = await execAsync("npm audit");
        if (stderr) {
            console.error(chalk.red(`Error running npm audit: ${stderr}`));
        } else {
            console.log(chalk.green("Security audit complete:"));
            console.log(stdout);
        }
    } catch (error) {
        console.error(chalk.red(`Error detecting security vulnerabilities: ${error.message}`));
    }
}

async function addNewFile(filePath) {
    console.log(chalk.cyan(`Adding new file: ${filePath}`));
    await createSubfolders(filePath);
    await createOrUpdateFile(filePath, "");
    console.log(chalk.green(`New file ${filePath} has been created.`));
}

async function chatInterface() {
    const { input } = await inquirer.prompt({
        type: "input",
        name: "input",
        message: "Enter your request (or 'exit' to quit):",
    });

    if (input.toLowerCase() === "exit") {
        return false;
    }

    const prompt = `
You are CodeCraftAI, an automatic coding assistant. The user has made the following request:

${input}

Please provide a response to help the user with their request. If it involves coding tasks, provide specific instructions or code snippets as needed.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    console.log(chalk.cyan("CodeCraftAI:"), response.content[0].text);
    return true;
}

async function main() {
    console.log(chalk.blue("Welcome to CodeCraftAI!"));

    const readmePath = path.join(process.cwd(), "README.md");
    let readme = await readFile(readmePath);
    if (!readme) {
        console.error(chalk.red("README.md not found or unable to read."));
        return;
    }

    while (true) {
        const { action } = await inquirer.prompt({
            type: "list",
            name: "action",
            message: "What would you like to do next?",
            choices: [
                "Process existing files",
                "Add a new file",
                "Update README.md",
                "Optimize project structure",
                "Detect security vulnerabilities",
                "Run code quality checks",
                "Generate documentation",
                "Chat interface",
                "Exit",
            ],
        });

        switch (action) {
            case "Process existing files":
                console.log(chalk.yellow("\nProcessing files..."));
                const filesToProcess = await getFilesToProcess();
                await processFiles(filesToProcess, readme);
                console.log(chalk.green("\nCodeCraftAI has successfully generated/updated your project files."));
                await manageDependencies();
                break;
            case "Add a new file":
                const { newFile } = await inquirer.prompt({
                    type: "input",
                    name: "newFile",
                    message: "Enter the name of the new file to create (include path if in subfolder):",
                });
                if (newFile) {
                    await addNewFile(path.join(process.cwd(), newFile));
                }
                break;
            case "Update README.md":
                console.log(chalk.cyan("Updating README.md with new design ideas and considerations..."));
                const updatedReadme = await updateReadme(readme);
                await writeFile(readmePath, updatedReadme);
                readme = updatedReadme;
                break;
            case "Optimize project structure":
                await optimizeProjectStructure();
                break;
            case "Detect security vulnerabilities":
                await detectSecurityVulnerabilities();
                break;
            case "Run code quality checks":
                const filesToCheck = await getFilesToProcess();
                for (const file of filesToCheck) {
                    await runCodeQualityChecks(file);
                }
                break;
            case "Generate documentation":
                const filesToDocument = await getFilesToProcess();
                for (const file of filesToDocument) {
                    const content = await readFile(file);
                    await generateDocumentation(file, content);
                }
                break;
            case "Chat interface":
                let chatContinue = true;
                while (chatContinue) {
                    chatContinue = await chatInterface();
                }
                break;
            case "Exit":
                console.log(chalk.yellow("Thanks for using CodeCraftAI. See you next time!"));
                return;
        }
    }
}

main().catch((error) => {
    console.error(chalk.red("An error occurred:"), error);
});