import Anthropic from "@anthropic-ai/sdk";
import UserInterface from "./userInterface.js";
import { CONFIG } from "./config.js";
import { getTextDeepseek } from "./deepseek.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

export async function getResponse(prompt) {
    const model = await UserInterface.getModel();
    const temperature = await UserInterface.getTemperature();

    if (model === "deepseek-reasoner") {
        return await getTextDeepseek(prompt, temperature);
    }

    const response = await anthropic.messages.create({
        model: model,
        max_tokens: CONFIG.maxTokens,
        temperature: temperature,
        messages: [{ role: "user", content: prompt }],
    });

    return response;
}
