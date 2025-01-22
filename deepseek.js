import OpenAI from "openai";

export const getTextDeepseek = async (prompt, temperature) => {
    const openai = new OpenAI({
        apiKey: process.env.DEEPSEEK_KEY,
        baseURL: "https://api.deepseek.com",
    });
    const messages = [{ role: "user", content: prompt }];

    const getResponse = async () => {
        const completion = await openai.chat.completions.create({
            model: "deepseek-reasoner",
            max_tokens: 8192,
            messages,
            temperature: temperature || 0.7,
        });
        return completion?.choices?.[0]?.message;
    };

    const response = await getResponse();
    return response?.content;
};

console.log(await getTextDeepseek("Hi"));
