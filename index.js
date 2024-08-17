#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ override: true });

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_KEY = process.env.CLAUDE_KEY;

if (!CLAUDE_KEY) {
    console.error("CLAUDE_KEY environment variable is not set. Please set it to your Claude API key.");
    process.exit(1);
}

async function parseReadme() {
    const readmePath = path.join(process.cwd(), "README.md");

    try {
        await fs.access(readmePath);
    } catch (error) {
        console.error("README.md not found in the current directory.");
        process.exit(1);
    }

    const content = await fs.readFile(readmePath, "utf8");
    return content;
}

async function generateCodeWithClaude(readmeContent) {
    const systemPrompt =
        "You are an expert software developer. Your task is to generate working code based on the README instructions provided. Focus on creating functional, well-structured code that implements the described features.";

    const userPrompt = `Please generate the main code file for a project based on the following README instructions. Ensure the code is complete, functional, and follows best practices:

${readmeContent}

Provide only the code without any explanations or markdown formatting.`;

    const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_KEY,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 4000,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

async function writeGeneratedCode(code) {
    const outputPath = path.join(process.cwd(), "index.js");
    await fs.writeFile(outputPath, code);
    console.log(`Generated code has been written to ${outputPath}`);
}

async function main() {
    console.log("CodeCraftAI - Generating your project...");

    try {
        const readmeContent = await parseReadme();
        const generatedCode = await generateCodeWithClaude(readmeContent);
        await writeGeneratedCode(generatedCode);

        console.log("Code generation complete!");
    } catch (error) {
        console.error("An error occurred:", error.message);
        process.exit(1);
    }
}

main();
