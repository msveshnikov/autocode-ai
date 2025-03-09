import Anthropic from "@anthropic-ai/sdk";
import UserInterface from "./userInterface.js";
import { CONFIG } from "./config.js";
import { getTextDeepseek } from "./deepseek.js";
import { getTextGpt } from "./openai.js";
import { getTextGemini } from "./gemini.js";
import chalk from "chalk";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

export async function getResponse(prompt) {
    const model = await UserInterface.getModel();
    const temperature = await UserInterface.getTemperature();

    if (model.startsWith("deepseek")) {
        return await getTextDeepseek(prompt, temperature, model);
    }

    if (model.startsWith("o3")) {
        return await getTextGpt(prompt, temperature, model);
    }

    if (model.startsWith("gemini")) {
        return await getTextGemini(prompt, temperature, model);
    }

    if (!process.env.CLAUDE_KEY) {
        console.log(chalk.red("Please set up CLAUDE_KEY environment variable"));
        process.exit(1);
    }

    let maxTokens = CONFIG.maxTokens;
    let thinkingConfig = undefined;

    if (model.includes("3.7")) {
        maxTokens = 20000;
        thinkingConfig = {
            type: "enabled",
            budget_tokens: 10000,
        };
    }

    const response = await anthropic.messages.create({
        model: model,
        max_tokens: maxTokens,
        ...(thinkingConfig && { thinking: thinkingConfig }),
        temperature: temperature,
        messages: [{ role: "user", content: prompt }],
    });

    return response;
}
