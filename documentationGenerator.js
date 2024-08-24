import chalk from "chalk";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";

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

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write(docFilePath, response.content[0].text);
        console.log(chalk.green(`✅ Documentation generated for ${filePath}`));
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

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write("DOCUMENTATION.md", response.content[0].text);
        console.log(chalk.green("✅ Project documentation generated"));
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
};

export default DocumentationGenerator;
