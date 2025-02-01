import chalk from "chalk";
import OpenAI from "openai";

export const getTextDeepseek = async (prompt, temperature, model) => {
    if (!process.env.DEEPSEEK_KEY) {
        console.log(chalk.red("Please set up DEEPSEEK_KEY environment variable"));
        process.exit(1);
    }

    const openai = new OpenAI({
        apiKey: process.env.DEEPSEEK_KEY,
        baseURL: "https://api.deepseek.com",
    });
    const messages = [{ role: "user", content: prompt }];

    const completion = await openai.chat.completions.create({
        model,
        max_tokens: 8192,
        messages,
        temperature: temperature || 0.7,
    });
    return { content: [{ text: completion?.choices?.[0]?.message.content }] };
};
