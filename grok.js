import Groq from "groq-sdk";
import { CONFIG } from "./config.js";

export async function getTextGrok(prompt, temperature, model, apiKey) {
    if (!(apiKey || process.env.GROK_KEY)) {
        console.log("Please set up GROK_KEY environment variable");
        process.exit(1);
    }
    const groq = new Groq({ apiKey: apiKey || process.env.GROK_KEY });

    const response = await groq.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: CONFIG.maxTokens,
        temperature: temperature,
    });

    return {
        content: [{ type: "text", text: response.choices[0].message.content }],
        usage: {
            input_tokens: response.usage.prompt_tokens,
            output_tokens: response.usage.completion_tokens,
        },
    };
}