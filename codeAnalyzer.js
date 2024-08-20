import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import path from "path";
import inquirer from "inquirer";

const execAsync = promisify(exec);
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const CodeAnalyzer = {
    async runLintChecks(filePath) {
        console.log(chalk.cyan(`🔍 Running code quality checks for ${filePath}...`));
        const fileExtension = path.extname(filePath);
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        if (!language) {
            console.log(chalk.yellow(`⚠️ No linter configured for file extension: ${fileExtension}`));
            return "";
        }

        const linter = CONFIG.languageConfigs[language].linter;
        try {
            const { stdout, stderr } = await execAsync(`npx ${linter} ${filePath}`, { encoding: "utf8" });
            if (stdout) console.log(chalk.yellow(`⚠️ ${linter} warnings:\n${stdout}`));
            if (stderr) console.error(chalk.red(`❌ ${linter} errors:\n${stderr}`));
            if (!stdout && !stderr) console.log(chalk.green(`✅ ${linter} passed for ${filePath}`));
            return stdout || stderr;
        } catch (error) {
            console.error(chalk.red(`❌ Error running ${linter}: ${error.message}`));
            return error.stdout || error.stderr || error.message;
        }
    },

    async fixLintErrors(filePath, lintOutput, projectStructure) {
        console.log(chalk.yellow(`🔧 Attempting to fix lint errors for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const fileExtension = path.extname(filePath);
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        const prompt = `
Please fix the following linter errors in the ${language} file ${filePath}:

${lintOutput}

Current file content:
${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide the corrected code that addresses all the linter errors. Consider the project structure when making changes. Do not include any explanations or comments in your response, just provide the code.
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
        const fileExtension = path.extname(filePath);
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        const prompt = `
Analyze the following ${language} code for quality and provide improvement suggestions:

${fileContent}

Please consider:
1. Adherence to DRY, KISS, and SRP principles
2. Code readability and maintainability
3. Potential performance improvements
4. Error handling and edge cases
5. Security considerations
6. ${language}-specific best practices

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
    
    ${JSON.stringify(projectStructure, null, 2)}
    
    Dependencies graph:
    
    ${JSON.stringify(await this.analyzeDependencies(projectStructure), null, 2)}
    
    Please identify:
    1. Missing packages based on import statements for each supported language
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

        const structuredResults = JSON.parse(response.content[0].text.match(/```json([\s\S]*?)```/)?.[1]);

        await this.createMissingFiles(structuredResults?.missingFiles);
    },

    async analyzeDependencies(projectStructure) {
        const dependencies = {};
        for (const [key, value] of Object.entries(projectStructure)) {
            if (typeof value === "object" && value !== null) {
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (subValue === null) {
                        const filePath = `${key}/${subKey}`;
                        const content = await FileManager.read(filePath);
                        dependencies[filePath] = this.extractDependencies(content, path.extname(filePath));
                    }
                }
            } else if (value === null) {
                const content = await FileManager.read(key);
                dependencies[key] = this.extractDependencies(content, path.extname(key));
            }
        }
        return dependencies;
    },

    extractDependencies(content, fileExtension) {
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        switch (language) {
            case "javascript":
                return this.extractJavaScriptDependencies(content);
            case "python":
                return this.extractPythonDependencies(content);
            case "csharp":
                return this.extractCSharpDependencies(content);
            default:
                return [];
        }
    },

    extractJavaScriptDependencies(content) {
        const importRegex =
            /(?:import\s+(?:\*\s+as\s+\w+\s+from\s+['"](.+?)['"]|{\s*[\w\s,]+\s*}\s+from\s+['"](.+?)['"]|\w+\s+from\s+['"](.+?)['"])|lazy\(\s*\(\)\s*=>\s*import\(['"](.+?)['"]\)\s*\))/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const dependency = match[1] || match[2] || match[3] || match[4];
            dependencies.push(dependency);
        }
        return dependencies;
    },

    extractPythonDependencies(content) {
        const importRegex = /(?:from\s+(\S+)\s+import|\bimport\s+(\S+))/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const dependency = match[1] || match[2];
            dependencies.push(dependency.split(".")[0]);
        }
        return [...new Set(dependencies)];
    },

    extractCSharpDependencies(content) {
        const usingRegex = /using\s+([^;]+);/g;
        const dependencies = [];
        let match;
        while ((match = usingRegex.exec(content)) !== null) {
            dependencies.push(match[1].trim());
        }
        return dependencies;
    },

    async createMissingFiles(missingFiles) {
        console.log(chalk.cyan("📁 Creating missing files..."));
        for (const filePath of missingFiles) {
            try {
                await this.addNewFile(filePath);
            } catch (error) {
                console.error(chalk.red(`❌ Error creating file ${filePath}: ${error.message}`));
            }
        }
    },

    async addNewFile(filePath) {
        console.log(chalk.cyan(`➕ Adding new file: ${filePath}`));
        await FileManager.createSubfolders(filePath);
        await FileManager.write(filePath, "");
        console.log(chalk.green(`✅ New file ${filePath} has been created.`));
    },

    async createMissingFilesFromLint(lintOutput, projectStructure) {
        const missingFileRegex = /Cannot find module '(.+?)'/g;
        const missingFiles = [...lintOutput.matchAll(missingFileRegex)].map((match) => match[1]);

        for (const file of missingFiles) {
            const filePath = path.join(process.cwd(), `${file}.js`);
            const { createFile } = await inquirer.prompt({
                type: "confirm",
                name: "createFile",
                message: `Do you want to create the missing file: ${filePath}?`,
                default: true,
            });

            if (createFile) {
                await this.addNewFile(filePath);
                console.log(chalk.green(`✅ Created missing file: ${filePath}`));
                const generatedContent = await CodeGenerator.generate("", "", filePath, projectStructure);
                await FileManager.write(filePath, generatedContent);
            }
        }
    },
};

export default CodeAnalyzer;
