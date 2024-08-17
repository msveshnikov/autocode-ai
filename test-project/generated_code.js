import fs from "fs";
import path from "path";
import { config } from "dotenv";
import axios from "axios";

config();

const CLAUDE_API_URL = "https://api.anthropic.com/v5/complete";
const CLAUDE_API_KEY = process.env.CLAUDE_KEY;

async function generateCode(instructions) {
    const payload = {
        prompt: instructions,
        model: "claude-v3.5-sonnet",
        max_tokens: 4096,
        temperature: 0.7,
        stop_sequences: ["Human:"],
    };

    const headers = {
        "Content-Type": "application/json",
        "X-API-Key": CLAUDE_API_KEY,
    };

    try {
        const response = await axios.post(CLAUDE_API_URL, payload, { headers });
        return response.data.completion;
    } catch (error) {
        console.error("Error generating code:", error);
        return null;
    }
}

async function saveCodeToFile(code, filePath) {
    try {
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, code);
        console.log(`Code saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving code to ${filePath}:`, error);
    }
}

async function main() {
    const readmeFilePath = path.join(process.cwd(), "README.md");

    try {
        const readmeContent = await fs.promises.readFile(readmeFilePath, "utf8");
        const generatedCode = await generateCode(readmeContent);

        if (generatedCode) {
            const outputFilePath = path.join(process.cwd(), "generated.js");
            await saveCodeToFile(generatedCode, outputFilePath);
        }
    } catch (error) {
        console.error(`Error reading README.md file:`, error);
    }
}

main();
