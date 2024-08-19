import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";

const execAsync = promisify(exec);
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const CodeAnalyzer = {
    async runLintChecks(filePath) {
        console.log(chalk.cyan(`🔍 Running code quality checks for ${filePath}...`));
        try {
            const { stdout, stderr } = await execAsync(`npx eslint ${filePath}`, { encoding: "utf8" });
            if (stdout) console.log(chalk.yellow(`⚠️ ESLint warnings:\n${stdout}`));
            if (stderr) console.error(chalk.red(`❌ ESLint errors:\n${stderr}`));
            if (!stdout && !stderr) console.log(chalk.green(`✅ ESLint passed for ${filePath}`));
            return stdout || stderr;
        } catch (error) {
            console.error(chalk.red(`❌ Error running ESLint: ${error.message}`));
            return error.stdout || error.stderr || error.message;
        }
    },

    async fixLintErrors(filePath, lintOutput, projectStructure) {
        console.log(chalk.yellow(`🔧 Attempting to fix lint errors for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const prompt = `
Please fix the following ESLint errors in the file ${filePath}:

${lintOutput}

Current file content:
${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide the corrected code that addresses all the ESLint errors. Consider the project structure when making changes. Do not include any explanations or comments in your response, just provide the code.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        await FileManager.write(filePath, response.content[0].text);
        console.log(chalk.green(`✅ Lint errors fixed for ${filePath}`));
    },

    async optimizeProjectStructure(projectStructure) {
        console.log(chalk.cyan("🔧 Optimizing project structure..."));

        const prompt = `
Analyze the following project structure and provide optimization suggestions:

${JSON.stringify(projectStructure, null, 2)}

Please provide suggestions for optimizing the project structure, including:
1. Reorganizing files and folders
2. Splitting or merging modules
3. Improving naming conventions
4. Enhancing overall project architecture

Provide the suggestions in a structured format.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        console.log(chalk.green("📊 Project structure optimization suggestions:"));
        console.log(response.content[0].text);
    },

    async analyzeCodeQuality(filePath) {
        console.log(chalk.cyan(`🔍 Analyzing code quality for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const prompt = `
Analyze the following code for quality and provide improvement suggestions:

${fileContent}

Please consider:
1. Adherence to DRY, KISS, and SRP principles
2. Code readability and maintainability
3. Potential performance improvements
4. Error handling and edge cases
5. Security considerations

Provide the suggestions in a structured format.
`;

        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        console.log(chalk.green(`📊 Code quality analysis for ${filePath}:`));
        console.log(response.content[0].text);
    },

    async detectMissingDependencies(projectStructure) {
        console.log(chalk.cyan("🔍 Detecting missing dependencies..."));
        const prompt = `
Analyze the following project structure and detect any missing dependencies or files:

${JSON.stringify(projectStructure)}

Dependencies graph:

${JSON.stringify(await this.analyzeDependencies(projectStructure))}

Please identify:
1. Missing npm packages based on import statements
2. Missing files that are referenced but not present in the project structure
3. Potential circular dependencies

Provide the results in a structured format.
`;
        const response = await anthropic.messages.create({
            model: CONFIG.anthropicModel,
            max_tokens: CONFIG.maxTokens,
            messages: [{ role: "user", content: prompt }],
        });

        console.log(chalk.green("📊 Missing dependencies analysis:"));
        console.log(response.content[0].text);
    },

    async analyzeDependencies(projectStructure) {
        const files = Object.keys(projectStructure);
        const dependencies = {};
        for (const file of files) {
            const content = await FileManager.read(file);
            const fileDependencies = this.extractDependencies(content);
            dependencies[file] = fileDependencies;
        }

        return dependencies;
    },

    extractDependencies(content) {
        const importRegex =
            /import\s+(?:\*\s+as\s+\w+\s+from\s+['"](.+?)['"]|{\s*[\w\s,]+\s*}\s+from\s+['"](.+?)['"]|\w+\s+from\s+['"](.+?)['"])/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const dependency = match[1] || match[2] || match[3];
            dependencies.push(dependency);
        }
        return dependencies;
    },
};

export default CodeAnalyzer;
