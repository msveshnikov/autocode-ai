import OpenAI from "openai";
import chalk from "chalk";

export const getTextGpt = async (prompt, temperature, model) => {
    if (!process.env.OPENAI_KEY) {
        console.log(chalk.red("Please set up OPENAI_KEY environment variable"));
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
    const messages = [
        {
            role: "user",
            content: [{ type: "text", text: prompt }],
        },
    ];

    const completion = await openai.chat.completions.create({
        model: model,
        messages,
        reasoning_effort: "high",
    });

    return { content: [{ text: completion?.choices?.[0]?.message.content }] };
};
