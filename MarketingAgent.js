import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const MarketingAgent = {
    async run(projectStructure, readme) {
        console.log(chalk.cyan("🚀 Running Marketing Agent..."));

        const marketingTasks = [
            this.generateMarketingStrategy,
            this.createSocialMediaContent,
            this.developEmailCampaign,
            this.analyzeCompetitors,
            this.createLandingPageCopy,
        ];

        for (const task of marketingTasks) {
            await task(projectStructure, readme);
        }

        console.log(chalk.green("✅ Marketing Agent tasks completed."));
    },

    async generateMarketingStrategy(projectStructure, readme) {
        const prompt = `
        As a marketing expert, analyze the following project README and structure:

        README:
        ${readme}

        Project Structure:
        ${JSON.stringify(projectStructure, null, 2)}

        Based on this information, create a comprehensive marketing strategy for the project. Include target audience, key messaging, marketing channels, and potential campaign ideas. Provide the strategy in a structured format suitable for a markdown file.
        `;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write("marketing_strategy.md", response.content[0].text);
        console.log(chalk.green("📊 Marketing strategy generated and saved to marketing_strategy.md"));
    },

    async createSocialMediaContent(projectStructure, readme) {
        const prompt = `
        Create a set of social media posts for Twitter, LinkedIn, and Facebook to promote the following project:

        README:
        ${readme}

        Project Structure:
        ${JSON.stringify(projectStructure, null, 2)}

        Provide 3 posts for each platform, highlighting key features and benefits of the project. Format the output as a JSON object with keys for each platform and an array of post content.
        `;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write("social_media_content.json", response.content[0].text);
        console.log(chalk.green("📱 Social media content generated and saved to social_media_content.json"));
    },

    async developEmailCampaign(projectStructure, readme) {
        const prompt = `
        Develop an email marketing campaign for the following project:

        README:
        ${readme}

        Project Structure:
        ${JSON.stringify(projectStructure, null, 2)}

        Create a series of 3 emails: an introduction email, a feature highlight email, and a call-to-action email. Provide the email subjects and body content in a format suitable for a markdown file.
        `;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write("email_campaign.md", response.content[0].text);
        console.log(chalk.green("📧 Email campaign developed and saved to email_campaign.md"));
    },

    async analyzeCompetitors(projectStructure, readme) {
        const prompt = `
        Analyze potential competitors for the following project:

        README:
        ${readme}

        Project Structure:
        ${JSON.stringify(projectStructure, null, 2)}

        Identify 3-5 potential competitors, their key features, strengths, and weaknesses compared to this project. Provide the analysis in a structured format suitable for a markdown file.
        `;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write("competitor_analysis.md", response.content[0].text);
        console.log(chalk.green("🔍 Competitor analysis completed and saved to competitor_analysis.md"));
    },

    async createLandingPageCopy(projectStructure, readme) {
        const prompt = `
        Create compelling copy for a landing page for the following project:

        README:
        ${readme}

        Project Structure:
        ${JSON.stringify(projectStructure, null, 2)}

        Generate a headline, subheadline, key features section, benefits section, and a call-to-action. Provide the content in HTML format, using appropriate tags for structure.
        `;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write("landing_page_copy.html", response.content[0].text);
        console.log(chalk.green("🌐 Landing page copy created and saved to landing_page_copy.html"));
    },
};

export default MarketingAgent;
