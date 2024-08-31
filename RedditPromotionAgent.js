import fetch from "node-fetch";
import FileManager from "./fileManager.js";
import chalk from "chalk";
import ora from "ora";

class RedditPromotionAgent {
    constructor() {
        this.subreddit = "AutoCode";
        this.apiBaseUrl = "https://oauth.reddit.com";
        this.clientId = process.env.REDDIT_CLIENT_ID;
        this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
        this.username = process.env.REDDIT_USERNAME;
        this.password = process.env.REDDIT_PASSWORD;
        this.accessToken = null;
        this.tokenExpiration = null;
    }

    async initialize() {
        await this.authenticate();
    }

    async authenticate() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
        const response = await fetch("https://www.reddit.com/api/v1/access_token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=password&username=${this.username}&password=${this.password}`,
        });

        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiration = Date.now() + data.expires_in * 1000;
    }

    async ensureAuthenticated() {
        if (!this.accessToken || Date.now() > this.tokenExpiration) {
            await this.authenticate();
        }
    }

    async createPost(title, content) {
        await this.ensureAuthenticated();
        const response = await fetch(`${this.apiBaseUrl}/api/submit`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `kind=self&sr=${this.subreddit}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(
                content
            )}`,
        });

        return response.json();
    }

    async getTopPosts(limit = 10) {
        await this.ensureAuthenticated();
        const response = await fetch(`${this.apiBaseUrl}/r/${this.subreddit}/top?limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        });

        return response.json();
    }

    async commentOnPost(postId, comment) {
        await this.ensureAuthenticated();
        const response = await fetch(`${this.apiBaseUrl}/api/comment`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `api_type=json&thing_id=${postId}&text=${encodeURIComponent(comment)}`,
        });

        return response.json();
    }

    async generatePromotionalContent() {
        const readme = await FileManager.read("README.md");
        const projectStructure = await FileManager.getProjectStructure();

        const content = `
Check out AutoCode - an innovative automatic coding tool!

Features:
${readme.split("## Features")[1]?.split("##")[0]?.trim()}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Visit https://autocode.work for more information!
    `.trim();

        return content;
    }

    async runPromotionCampaign() {
        const spinner = ora("Running Reddit promotion campaign...").start();
        try {
            const content = await this.generatePromotionalContent();
            const title = "Introducing AutoCode: Your AI-Powered Coding Assistant";

            const postResult = await this.createPost(title, content);
            console.log(chalk.green("Promotional post created:", postResult));

            const topPosts = await this.getTopPosts(5);
            for (const post of topPosts.data.children) {
                const comment = "Have you tried AutoCode? It's revolutionizing how we approach coding projects!";
                const commentResult = await this.commentOnPost(post.data.name, comment);
                console.log(chalk.green("Comment added to post:", post.data.title, commentResult));
            }
            spinner.succeed("Reddit promotion campaign completed successfully");
        } catch (error) {
            spinner.fail("Reddit promotion campaign failed");
            console.error(chalk.red("Error during Reddit promotion:", error.message));
        }
    }

    async run() {
        console.log(chalk.cyan("🤖 Running Promotion Agent..."));
        await this.initialize();
        await this.runPromotionCampaign();
        console.log(chalk.green("✅ Promotion Agent has completed its tasks."));
    }
}

export default new RedditPromotionAgent();
