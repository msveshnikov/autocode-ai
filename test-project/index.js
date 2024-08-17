#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import axios from "axios";
import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLAUDE_API_KEY = process.env.CLAUDE_KEY;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

if (!CLAUDE_API_KEY) {
    console.error(chalk.red("Error: CLAUDE_KEY not found in .env file"));
    process.exit(1);
}

async function readReadmeFile() {
    try {
        const readmePath = path.join(process.cwd(), "README.md");
        const readmeContent = await fs.readFile(readmePath, "utf-8");
        return readmeContent;
    } catch (error) {
        console.error(chalk.red("Error reading README.md file:", error.message));
        process.exit(1);
    }
}

async function generateCode(instructions) {
    const spinner = ora("Generating code...").start();

    try {
        const response = await axios.post(
            CLAUDE_API_URL,
            {
                model: "claude-3-sonnet-20240229",
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: `Generate code based on the following README instructions:\n\n${instructions}\n\nProvide only the code without any explanations or markdown formatting.`,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01",
                },
            }
        );

        spinner.succeed("Code generated successfully");
        return response.data.content[0].text;
    } catch (error) {
        spinner.fail("Error generating code");
        console.error(chalk.red("Error:", error.response?.data?.error?.message || error.message));
        process.exit(1);
    }
}

async function saveGeneratedCode(code) {
    const { fileName } = await inquirer.prompt([
        {
            type: "input",
            name: "fileName",
            message: "Enter the file name to save the generated code:",
            default: "generated_code.js",
        },
    ]);

    const filePath = path.join(process.cwd(), fileName);

    try {
        await fs.writeFile(filePath, code);
        console.log(chalk.green(`Code saved successfully to ${filePath}`));
    } catch (error) {
        console.error(chalk.red("Error saving generated code:", error.message));
        process.exit(1);
    }
}

async function main() {
    console.log(chalk.blue("Welcome to CodeCraftAI!"));

    const readmeContent = await readReadmeFile();
    const generatedCode = await generateCode(readmeContent);
    await saveGeneratedCode(generatedCode);

    console.log(chalk.green("CodeCraftAI execution completed successfully!"));
}

main().catch((error) => {
    console.error(chalk.red("An unexpected error occurred:", error.message));
    process.exit(1);
});
