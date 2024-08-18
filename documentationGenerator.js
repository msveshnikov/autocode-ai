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
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write(docFilePath, response.content[0].text);
        console.log(chalk.green(`✅ Documentation generated for ${filePath}`));
    },
};

export default DocumentationGenerator;
