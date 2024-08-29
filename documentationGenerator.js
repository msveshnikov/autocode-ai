import chalk from "chalk";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import UserInterface from "./userInterface.js";
import ora from "ora";
import CodeGenerator from "./codeGenerator.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const DocumentationGenerator = {
    async generate(filePath, content, projectStructure) {
        console.log(chalk.cyan(`📝 Generating documentation for ${filePath}...`));
        const docFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.md`);

        const prompt = `
Generate documentation for the following code file:

File: ${filePath}

Content:
${content}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide comprehensive documentation for the code above. Include an overview, function/method descriptions, parameters, return values, and usage examples where applicable. Consider the project structure when describing the file's role in the overall project. Format the documentation in Markdown.
`;

        const spinner = ora("Generating documentation...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Documentation generated");
            await FileManager.write(docFilePath, response.content[0].text);
            console.log(chalk.green(`✅ Documentation generated for ${filePath}`));
            await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
        } catch (error) {
            spinner.fail("Documentation generation failed");
            console.error(chalk.red(`Error generating documentation for ${filePath}: ${error.message}`));
        }
    },

    async generateProjectDocumentation(projectStructure) {
        console.log(chalk.cyan("📚 Generating project-wide documentation..."));
        const readmeContent = await FileManager.read("README.md");
        const filesContent = await this.getFilesContent(projectStructure);

        const prompt = `
Generate comprehensive project documentation based on the following information:

README.md content:
${readmeContent}

Project structure and file contents:
${JSON.stringify(filesContent, null, 2)}

Please provide a detailed project overview, architecture description, module interactions, and usage instructions. Include information about the project's features, installation, and any other relevant details. Format the documentation in Markdown.
`;

        const spinner = ora("Generating project documentation...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Project documentation generated");
            await FileManager.write("DOCUMENTATION.md", response.content[0].text);
            console.log(chalk.green("✅ Project documentation generated"));
            await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
        } catch (error) {
            spinner.fail("Project documentation generation failed");
            console.error(chalk.red(`Error generating project documentation: ${error.message}`));
        }
    },

    async getFilesContent(projectStructure) {
        const filesContent = {};
        for (const [filePath, content] of Object.entries(projectStructure)) {
            if (content === null) {
                filesContent[filePath] = await FileManager.read(filePath);
            } else {
                filesContent[filePath] = content;
            }
        }
        return filesContent;
    },

    async generateUnitTestDocumentation(filePath, testContent) {
        console.log(chalk.cyan(`📝 Generating unit test documentation for ${filePath}...`));
        const docFilePath = path.join(
            path.dirname(filePath),
            `${path.basename(filePath, path.extname(filePath))}_tests.md`
        );

        const prompt = `
Generate documentation for the following unit test file:

File: ${filePath}

Content:
${testContent}

Please provide comprehensive documentation for the unit tests above. Include an overview of the test suite, descriptions of individual test cases, and any setup or teardown procedures. Format the documentation in Markdown.
`;

        const spinner = ora("Generating unit test documentation...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Unit test documentation generated");
            await FileManager.write(docFilePath, response.content[0].text);
            console.log(chalk.green(`✅ Unit test documentation generated for ${filePath}`));
            await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
        } catch (error) {
            spinner.fail("Unit test documentation generation failed");
            console.error(chalk.red(`Error generating unit test documentation for ${filePath}: ${error.message}`));
        }
    },

    async generateAPIDocumentation(projectStructure, readme) {
        console.log(chalk.cyan("📚 Generating API documentation..."));
        const apiFiles = Object.keys(projectStructure).filter(
            (file) => file.includes("routes") || file.includes("controllers")
        );
        const apiContents = await Promise.all(apiFiles.map((file) => FileManager.read(file)));

        const prompt = `
Generate comprehensive API documentation based on README.md and the following API-related files:

${apiFiles.map((file, index) => `${file}:\n${apiContents[index]}`).join("\n\n")}


README.md content:
${readme}

Please provide detailed documentation for each API endpoint, including:
1. Endpoint URL
2. HTTP method
3. Request parameters
4. Request body (if applicable)
5. Response format
6. Response codes
7. Authentication requirements (if any)
8. Rate limiting information (if applicable)

Format the documentation in Markdown, suitable for inclusion in a README or separate API documentation file.
`;

        const spinner = ora("Generating API documentation...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("API documentation generated");
            await FileManager.write("API_DOCUMENTATION.md", response.content[0].text);
            console.log(chalk.green("✅ API documentation generated"));
            await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
        } catch (error) {
            spinner.fail("API documentation generation failed");
            console.error(chalk.red(`Error generating API documentation: ${error.message}`));
        }
    },

    async generateChangeLog(commitMessages) {
        console.log(chalk.cyan("📝 Generating change log..."));

        const prompt = `
Generate a change log based on the following commit messages:

${commitMessages.join("\n")}

Please categorize the changes into:
1. New features
2. Bug fixes
3. Improvements
4. Breaking changes (if any)

Format the change log in Markdown, suitable for inclusion in a CHANGELOG.md file.
`;

        const spinner = ora("Generating change log...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Change log generated");
            await FileManager.write("CHANGELOG.md", response.content[0].text);
            console.log(chalk.green("✅ Change log generated"));
            await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
        } catch (error) {
            spinner.fail("Change log generation failed");
            console.error(chalk.red(`Error generating change log: ${error.message}`));
        }
    },
};

export default DocumentationGenerator;
