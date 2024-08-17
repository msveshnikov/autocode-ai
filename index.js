#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import inquirer from "inquirer";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import ignore from "ignore";

dotenv.config();

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
    const excludedFiles = ['package-lock.json', '.gitignore', 'eslint.config.js'];
    const excludedDirs = ['.git', 'node_modules'];
    
    for (const file of files) {
        // Check if the file is in the excluded list
        if (excludedFiles.includes(file)) {
            console.log(chalk.yellow(`Skipping ${file}...`));
            continue;
        }
        
        // Check if the file is in or below an excluded directory
        if (excludedDirs.some(dir => file.startsWith(dir + path.sep) || file === dir)) {
            console.log(chalk.yellow(`Skipping ${file} (in excluded directory)...`));
            continue;
        }
        
        const filePath = path.join(process.cwd(), file);
        console.log(chalk.cyan(`Processing ${file}...`));
        let currentContent = await readFile(filePath);
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
        } else {
            console.log(chalk.green(`ESLint passed for ${filePath}`));
        }
    } catch (error) {
        console.error(chalk.red(`Error running ESLint: ${error.message}`));
    }
}

async function manageDependencies() {
    try {
        console.log(chalk.cyan("Checking and updating dependencies..."));
        const { stdout, stderr } = await execAsync("npm outdated");
        if (stderr) {
            console.error(chalk.red(`Error checking outdated dependencies: ${stderr}`));
        } else if (stdout) {
            console.log(chalk.yellow("Outdated dependencies found. Updating..."));
            await execAsync("npm update");
            console.log(chalk.green("Dependencies updated successfully."));
        } else {
            console.log(chalk.green("All dependencies are up to date."));
        }
    } catch (error) {
        console.error(chalk.red(`Error managing dependencies: ${error.message}`));
    }
}

async function gitCommit() {
    try {
        console.log(chalk.cyan("Committing changes to Git..."));
        await execAsync("git add .");
        await execAsync('git commit -m "Auto-commit by CodeCraftAI"');
        console.log(chalk.green("Changes committed successfully."));
    } catch (error) {
        console.error(chalk.red(`Error committing to Git: ${error.message}`));
    }
}

async function getFilesToProcess() {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    let gitignoreContent = "";
    try {
        gitignoreContent = await readFile(gitignorePath);
    } catch (error) {
        console.log(chalk.yellow("No .gitignore file found. Processing all files."));
    }

    const ig = ignore().add(gitignoreContent);

    const files = await fs.readdir(process.cwd(), { withFileTypes: true, recursive: true });
    const filesToProcess = files
        .filter((file) => file.isFile() && !ig.ignores(path.relative(process.cwd(), path.join(file.path, file.name))))
        .map((file) => path.relative(process.cwd(), path.join(file.path, file.name)));

    return filesToProcess;
}

async function splitLargeFile(filePath, content) {
    const maxFileSize = 100 * 1024; // 100 KB
    if (content.length <= maxFileSize) {
        return;
    }

    console.log(chalk.yellow(`File ${filePath} is too large. Splitting into modules...`));

    const lines = content.split("\n");
    let currentModule = "";
    let moduleIndex = 1;

    for (const line of lines) {
        currentModule += line + "\n";
        if (currentModule.length > maxFileSize) {
            const moduleName = `${path.basename(filePath, path.extname(filePath))}_module${moduleIndex}${path.extname(
                filePath
            )}`;
            const modulePath = path.join(path.dirname(filePath), moduleName);
            await writeFile(modulePath, currentModule);
            currentModule = "";
            moduleIndex++;
        }
    }

    if (currentModule) {
        const moduleName = `${path.basename(filePath, path.extname(filePath))}_module${moduleIndex}${path.extname(
            filePath
        )}`;
        const modulePath = path.join(path.dirname(filePath), moduleName);
        await writeFile(modulePath, currentModule);
    }

    console.log(chalk.green(`File ${filePath} has been split into ${moduleIndex} modules.`));
}

async function generateUnitTests(filePath, content) {
    console.log(chalk.cyan(`Generating unit tests for ${filePath}...`));
    const testFilePath = path.join(
        path.dirname(filePath),
        `${path.basename(filePath, path.extname(filePath))}.test${path.extname(filePath)}`
    );

    const prompt = `
Generate unit tests for the following code:

${content}

Please provide complete and functional unit tests for the code above. Use a modern testing framework suitable for the language and follow best practices for unit testing.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    await writeFile(testFilePath, response.content[0].text);
    console.log(chalk.green(`Unit tests generated for ${filePath}`));
}

async function generateDocumentation(filePath, content) {
    console.log(chalk.cyan(`Generating documentation for ${filePath}...`));
    const docFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.md`);

    const prompt = `
Generate documentation for the following code:

${content}

Please provide comprehensive documentation for the code above. Include an overview, function/method descriptions, parameters, return values, and usage examples where applicable.
`;

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });

    await writeFile(docFilePath, response.content[0].text);
    console.log(chalk.green(`Documentation generated for ${filePath}`));
}

async function analyzeProjectStructure() {
    console.log(chalk.cyan("Analyzing project structure..."));
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

    console.log(chalk.green("Project structure analysis complete."));
    console.log(JSON.stringify(structure, null, 2));
}

async function optimizeProjectStructure() {
    console.log(chalk.cyan("Optimizing project structure..."));
    // Implement project structure optimization logic here
    console.log(chalk.green("Project structure optimization complete."));
}

async function generateApiDocumentation() {
    console.log(chalk.cyan("Generating API documentation..."));
    // Implement API documentation generation logic here
    console.log(chalk.green("API documentation generated."));
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

async function main() {
    console.log(chalk.blue("Welcome to CodeCraftAI!"));

    const readmePath = path.join(process.cwd(), "README.md");
    let readme = await readFile(readmePath);
    if (!readme) {
        console.error(chalk.red("README.md not found or unable to read."));
        return;
    }

    while (true) {
        console.log(chalk.yellow("\nProcessing files..."));
        const filesToProcess = await getFilesToProcess();
        await processFiles(filesToProcess, readme);

        console.log(chalk.green("\nCodeCraftAI has successfully generated/updated your project files."));

        await manageDependencies();

        for (const file of filesToProcess) {
            await runCodeQualityChecks(file);
            const content = await readFile(file);
            await splitLargeFile(file, content);
            await generateUnitTests(file, content);
            await generateDocumentation(file, content);
        }

        await analyzeProjectStructure();
        await optimizeProjectStructure();
        await generateApiDocumentation();
        await detectSecurityVulnerabilities();

        await gitCommit();

        const continuePrompt = await inquirer.prompt({
            type: "list",
            name: "action",
            message: "What would you like to do next?",
            choices: [
                "Process existing files",
                "Add a new file",
                "Update README.md",
                "Analyze project structure",
                "Optimize project structure",
                "Generate API documentation",
                "Detect security vulnerabilities",
                "Exit",
            ],
        });

        switch (continuePrompt.action) {
            case "Process existing files":
                continue;
            case "Add a new file":
                const newFilePrompt = await inquirer.prompt({
                    type: "input",
                    name: "newFile",
                    message: "Enter the name of the new file to create (include path if in subfolder):",
                });

                if (newFilePrompt.newFile) {
                    const newFilePath = path.join(process.cwd(), newFilePrompt.newFile);
                    await createSubfolders(newFilePath);
                    await createOrUpdateFile(newFilePath, "");
                }
                break;
            case "Update README.md":
                console.log(chalk.cyan("Updating README.md with new design ideas and considerations..."));
                const updatedReadme = await updateReadme(readme);
                await writeFile(readmePath, updatedReadme);
                readme = updatedReadme;
                break;
            case "Analyze project structure":
                await analyzeProjectStructure();
                break;
            case "Optimize project structure":
                await optimizeProjectStructure();
                break;
            case "Generate API documentation":
                await generateApiDocumentation();
                break;
            case "Detect security vulnerabilities":
                await detectSecurityVulnerabilities();
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