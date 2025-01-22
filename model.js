import Anthropic from "@anthropic-ai/sdk";
import UserInterface from "./userInterface.js";
import { CONFIG } from "./config.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

export async function getResponse(prompt) {
    return await anthropic.messages.create({
        model: await UserInterface.getModel(),
        max_tokens: CONFIG.maxTokens,
        temperature: await UserInterface.getTemperature(),
        messages: [{ role: "user", content: prompt }],
    });
}
