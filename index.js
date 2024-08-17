#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config({ override: true });

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
    const anthropic = new Anthropic({ apiKey: CLAUDE_KEY });

    const systemPrompt =
        "You are an expert software developer. Your task is to generate working code based on the README instructions provided. Focus on creating functional, well-structured code that implements the described features.";

    const userPrompt = `Please generate the main code file for a project based on the following README instructions. Ensure the code is complete, functional, and follows best practices:
  
  ${readmeContent}
  
  Provide only the code without any explanations or markdown formatting.`;

    const response = await anthropic.messages.create(
        {
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            temperature: 0.7,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
        },
        {
            headers: { "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15" },
        }
    );

    return response.content[0].text;
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
