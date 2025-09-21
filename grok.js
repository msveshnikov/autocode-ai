import OpenAI from "openai";

export async function getTextGrok(prompt, temperature = 0.7, model = "grok-4-fast",  apiKey) {
    const openai = new OpenAI({
        apiKey: apiKey || process.env.GROK_KEY,
        baseURL: "https://api.x.ai/v1",
    });

    const requestParams = {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
    };
    const completion = await openai.chat.completions.create(requestParams);
    return completion?.choices?.[0]?.message?.content;
}
