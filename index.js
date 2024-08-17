#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import inquirer from "inquirer";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_KEY,
});

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

async function main() {
    console.log(chalk.blue("Welcome to CodeCraftAI!"));

    const readmePath = path.join(process.cwd(), "README.md");
    let readme = await readFile(readmePath);
    if (!readme) {
        console.error(chalk.red("README.md not found or unable to read."));
        return;
    }

    let filesToProcess = ["index.js"];

    while (true) {
        console.log(chalk.yellow("\nProcessing files..."));
        await processFiles(filesToProcess, readme);

        console.log(chalk.green("\nCodeCraftAI has successfully generated/updated your project files."));

        const continuePrompt = await inquirer.prompt({
            type: "list",
            name: "action",
            message: "What would you like to do next?",
            choices: ["Process existing files", "Add a new file", "Update README.md", "Exit"],
        });

        if (continuePrompt.action === "Process existing files") {
            continue;
        } else if (continuePrompt.action === "Add a new file") {
            const newFilePrompt = await inquirer.prompt({
                type: "input",
                name: "newFile",
                message: "Enter the name of the new file to create:",
            });

            if (newFilePrompt.newFile) {
                filesToProcess.push(newFilePrompt.newFile);
            }
        } else if (continuePrompt.action === "Update README.md") {
            console.log(chalk.cyan("Updating README.md with new design ideas and considerations..."));
            const updatedReadme = await updateReadme(readme);
            await writeFile(readmePath, updatedReadme);
            readme = updatedReadme;
        } else {
            console.log(chalk.yellow("Thanks for using CodeCraftAI. See you next time!"));
            break;
        }
    }
}

main().catch((error) => {
    console.error(chalk.red("An error occurred:"), error);
});
