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
        console.log(`File ${filePath} has been updated.`);
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
    }
}

async function generateCode(readme, currentCode) {
    const prompt = `
You are CodeCraftAI, an automatic coding tool. Your task is to generate or update the index.js file based on the README.md instructions and the current index.js content (if any).

README.md content:
${readme}

Current index.js content (if exists):
${currentCode || "No existing code"}

Please generate or update the index.js file to implement the features described in the README. Ensure the code is complete, functional, and follows best practices. Use ES6 imports and async/await syntax. Do not include any explanations or comments in your response, just provide the code.
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
        console.log(`File ${filePath} has been created/updated.`);
    } catch (error) {
        console.error(`Error creating/updating file ${filePath}:`, error);
    }
}

async function processFiles(files, readme) {
    for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        let currentContent = await readFile(filePath);
        const generatedContent = await generateCode(readme, currentContent);
        await createOrUpdateFile(filePath, generatedContent);
    }
}

async function main() {
    const readmePath = path.join(process.cwd(), "README.md");
    const readme = await readFile(readmePath);
    if (!readme) {
        console.error("README.md not found or unable to read.");
        return;
    }

    const filesToProcess = ["index.js"];

    await processFiles(filesToProcess, readme);

    console.log(chalk.green("CodeCraftAI has successfully generated/updated your project files."));

    const continuePrompt = await inquirer.prompt({
        type: "confirm",
        name: "continue",
        message: "Do you want to continue with your project?",
        default: true,
    });

    if (continuePrompt.continue) {
        console.log(chalk.cyan("Great! Let's keep building your project."));
        const newFilePrompt = await inquirer.prompt({
            type: "input",
            name: "newFile",
            message: "Enter the name of a new file to create (or press enter to skip):",
        });

        if (newFilePrompt.newFile) {
            filesToProcess.push(newFilePrompt.newFile);
            await processFiles([newFilePrompt.newFile], readme);
        }
    } else {
        console.log(chalk.yellow("Thanks for using CodeCraftAI. See you next time!"));
    }
}

main().catch((error) => {
    console.error(chalk.red("An error occurred:"), error);
});
