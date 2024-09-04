import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import chalk from "chalk";
import ora from "ora";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const ProductOwnerAgent = {
    async run(projectStructure, readme) {
        console.log(chalk.cyan("🤖 Product Owner Agent: Managing product backlog and prioritizing features"));

        const spinner = ora("Analyzing project and generating recommendations...").start();

        try {
            const prompt = `
As the Product Owner Agent, your task is to manage the product backlog and prioritize features for the following project:

README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide the following:
1. A prioritized list of features for the next sprint (maximum 5 items)
2. A brief explanation for each prioritized feature
3. Suggestions for potential new features or improvements
4. Any risks or concerns you've identified
5. Recommendations for the development team

Ensure your response is structured and easy to read. Use markdown formatting where appropriate.
`;

            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Analysis complete");

            const outputPath = "product_owner_recommendations.md";
            await FileManager.write(outputPath, response.content[0].text);

            console.log(chalk.green(`✅ Product Owner recommendations have been saved to ${outputPath}`));
            console.log(chalk.yellow("Please review the recommendations and update your project accordingly."));
        } catch (error) {
            spinner.fail("Analysis failed");
            console.error(chalk.red(`Error: ${error.message}`));
        }
    },

    async updateBacklog(projectStructure, readme) {
        console.log(chalk.cyan("🔄 Product Owner Agent: Updating product backlog"));

        const spinner = ora("Updating backlog...").start();

        try {
            const backlogPath = "product_backlog.md";
            const currentBacklog = (await FileManager.read(backlogPath)) || "";

            const prompt = `
As the Product Owner Agent, update the product backlog based on the current project state and recent developments:

README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Current backlog:
${currentBacklog}

Please provide an updated product backlog with the following:
1. New features or user stories
2. Updated priorities for existing items
3. Removed or completed items
4. Any additional notes or comments

Format the backlog in markdown, with clear sections and priorities.
`;

            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Backlog updated");

            await FileManager.write(backlogPath, response.content[0].text);

            console.log(chalk.green(`✅ Product backlog has been updated and saved to ${backlogPath}`));
        } catch (error) {
            spinner.fail("Backlog update failed");
            console.error(chalk.red(`Error: ${error.message}`));
        }
    },

    async generateSprintPlan(projectStructure, readme) {
        console.log(chalk.cyan("📅 Product Owner Agent: Generating sprint plan"));

        const spinner = ora("Creating sprint plan...").start();

        try {
            const backlogPath = "product_backlog.md";
            const currentBacklog = (await FileManager.read(backlogPath)) || "";

            const prompt = `
As the Product Owner Agent, create a sprint plan based on the current product backlog and project state:

README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Current backlog:
${currentBacklog}

Please provide a sprint plan with the following:
1. Sprint goal
2. Selected user stories or tasks for the sprint (maximum 7 items)
3. Estimated effort for each item (use story points or time estimates)
4. Any dependencies or risks associated with the sprint items
5. Definition of Done for the sprint

Format the sprint plan in markdown, with clear sections and priorities.
`;

            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Sprint plan created");

            const sprintPlanPath = "sprint_plan.md";
            await FileManager.write(sprintPlanPath, response.content[0].text);

            console.log(chalk.green(`✅ Sprint plan has been generated and saved to ${sprintPlanPath}`));
        } catch (error) {
            spinner.fail("Sprint plan generation failed");
            console.error(chalk.red(`Error: ${error.message}`));
        }
    },
};

export default ProductOwnerAgent;
