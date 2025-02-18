import Anthropic from "@anthropic-ai/sdk";
import UserInterface from "./userInterface.js";
import { CONFIG } from "./config.js";
import { getTextDeepseek } from "./deepseek.js";
import { getTextGpt } from "./openai.js";
import { getTextGemini } from "./gemini.js";

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

    const response = await anthropic.messages.create({
        model: model,
        max_tokens: CONFIG.maxTokens,
        temperature: temperature,
        messages: [{ role: "user", content: prompt }],
    });

    return response;
}
