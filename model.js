import Anthropic from "@anthropic-ai/sdk";
import UserInterface from "./userInterface.js";
import { CONFIG } from "./config.js";
import { getTextDeepseek } from "./deepseek.js";
import { getTextGpt } from "./openai.js";
import { getTextGemini } from "./gemini.js";
import { getTextGrok } from "./grok.js";
import chalk from "chalk";
import axios from "axios"; // Added axios import

export async function getResponse(prompt, model, apiKey, maxNewTokens = 100) { // Added maxNewTokens
    model = model || (await UserInterface.getModel());
    const temperature = await UserInterface.getTemperature(); // Temperature might not be used by OpenVINO server directly

    if (model === "openvino_local") {
        console.log(chalk.yellow(`🧪 Using local OpenVINO model via: ${CONFIG.localOpenVinoServerUrl}`));
        try {
            const payload = {
                prompt: prompt,
                max_new_tokens: maxNewTokens
            };
            const response = await axios.post(CONFIG.localOpenVinoServerUrl, payload, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data && response.data.generated_text) {
                // Mimic the structure of Anthropic's response for consistency downstream
                return {
                    content: [{ type: "text", text: response.data.generated_text }],
                    usage: { input_tokens: 0, output_tokens: 0 } // Placeholder for usage if not provided
                };
            } else {
                console.error(chalk.red("Error: Local OpenVINO server response did not contain 'generated_text'. Response:"), response.data);
                throw new Error("Local OpenVINO server response format error.");
            }
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(chalk.red(`Error from OpenVINO server: ${error.response.status} - ${JSON.stringify(error.response.data)}`));
                throw new Error(`OpenVINO server error: ${error.response.status} - ${error.response.data.error || "Unknown error"}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error(chalk.red(`Error: No response from OpenVINO server at ${CONFIG.localOpenVinoServerUrl}. Is it running?`));
                throw new Error(`No response from OpenVINO server. Ensure it's running at ${CONFIG.localOpenVinoServerUrl}.`);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error(chalk.red(`Error making request to OpenVINO server: ${error.message}`));
                throw new Error(`Error making request to OpenVINO server: ${error.message}`);
            }
        }
    }

    if (model.startsWith("deepseek")) {
        return await getTextDeepseek(prompt, temperature, model, apiKey);
    }

    if (model.startsWith("grok")) {
        return await getTextGrok(prompt, temperature, model, apiKey);
    }

    if (model.startsWith("o3") || model.startsWith("o4") || model.startsWith("gpt")) {
        return await getTextGpt(prompt, temperature, model, apiKey);
    }

    if (model.startsWith("gemini")) {
        return await getTextGemini(prompt, temperature, model, apiKey);
    }

    if (!(apiKey || process.env.CLAUDE_KEY)) {
        console.log(chalk.red("Please set up CLAUDE_KEY environment variable"));
        process.exit(1);
    }

    const anthropic = new Anthropic({ apiKey: apiKey || process.env.CLAUDE_KEY });

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
