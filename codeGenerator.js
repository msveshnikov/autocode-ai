import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import chalk from "chalk";
import inquirer from "inquirer";
import path from "path";
import FileManager from "./fileManager.js";
import ora from "ora";
import CodeAnalyzer from "./codeAnalyzer.js";
import DocumentationGenerator from "./documentationGenerator.js";
import UserInterface from "./userInterface.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

const CodeGenerator = {
    async generate(readme, currentCode, fileName, projectStructure, allFileContents) {
        const fileExtension = path.extname(fileName);
        const language = this.getLanguageFromExtension(fileExtension);
        const languageConfig = CONFIG.languageConfigs[language];

        const prompt = `
You are AutoCode, an automatic coding tool. Your task is to generate or update the ${fileName} file based on the README.md instructions, the current ${fileName} content (if any), the project structure, and the content of all other files.

README.md content:
${readme}

Current ${fileName} content (if exists):
${currentCode || "No existing code"}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Content of other selected files:
${Object.entries(allFileContents)
    .filter(([key]) => key !== fileName)
    .map(([key, value]) => `${key}:\n${value}`)
    .join("\n\n")}

Language: ${language}
File extension: ${fileExtension}
Linter: ${languageConfig.linter}
Formatter: ${languageConfig.formatter}
Package manager: ${languageConfig.packageManager}

Please generate or update the ${fileName} file to implement the features described in the README. Ensure the code is complete, functional, and follows best practices for ${language}. Consider the project structure and the content of other selected files when making changes or adding new features. Reuse functionality from other modules and avoid duplicating code. Do not include any explanations or comments in your response, just provide the code.
`;

        const spinner = ora("Generating code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Code generated successfully");
            return response.content[0].text;
        } catch (error) {
            spinner.fail("Error generating code");
            throw error;
        }
    },

    async updateReadme(readme, projectStructure) {
        const prompt = `
You are AutoCode, an automatic coding tool. Your task is to update the README.md file with new design ideas and considerations based on the current content and project structure.

Current README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please update the README.md file with new design ideas and considerations. Ensure the content is well-structured and follows best practices. Consider the current project structure when suggesting improvements or new features. Include information about multi-language support and any new features or changes. Do not include any explanations or comments in your response, just provide the updated README.md content.
`;

        const spinner = ora("Updating README...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("README updated successfully");
            return response.content[0].text;
        } catch (error) {
            spinner.fail("Error updating README");
            throw error;
        }
    },

    async splitLargeFile(filePath, content, projectStructure) {
        console.log(chalk.yellow(`📂 File ${filePath} exceeds ${CONFIG.maxFileLines} lines. Splitting...`));

        const fileExtension = path.extname(filePath);
        const language = this.getLanguageFromExtension(fileExtension);

        const prompt = `
The file ${filePath} exceeds ${
            CONFIG.maxFileLines
        } lines. Please suggest how to split this file into smaller, more manageable parts. Consider the following:

1. Identify logical components or functionalities that can be separated.
2. Suggest new file names for the extracted parts.
3. Provide the content for each new file, including the updated content for the original file.
4. Ensure that the split maintains the overall functionality and doesn't break any dependencies.
5. Use appropriate language-specific conventions for ${language}.

Current file content:
${content}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please provide your suggestions in the following Markdown format:

# Original File: [original_file_name]
[content for the original file]

# New File: [new_file_name_1]
[content for new_file_1]

# New File: [new_file_name_2]
[content for new_file_2]

... (repeat for all new files)
`;

        const spinner = ora("Generating file split suggestion...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("File split suggestion generated");

            const splitSuggestion = response.content[0].text;
            console.log(chalk.cyan("📋 File splitting suggestion:"));
            console.log(splitSuggestion);

            const { confirmSplit } = await inquirer.prompt({
                type: "confirm",
                name: "confirmSplit",
                message: "Do you want to proceed with the suggested file split?",
                default: true,
            });

            if (confirmSplit) {
                const files = this.parseSplitSuggestion(splitSuggestion);
                await this.saveFiles(filePath, files);
                console.log(chalk.green("✅ File split completed."));
            } else {
                console.log(chalk.yellow("⏹️ File split cancelled."));
            }
        } catch (error) {
            spinner.fail("Error generating file split suggestion");
            throw error;
        }
    },

    parseSplitSuggestion(suggestion) {
        const files = {};
        const fileRegex = /# (?:Original File|New File): (.+)\n([\s\S]+?)(?=\n# (?:Original File|New File)|$)/g;
        let match;

        while ((match = fileRegex.exec(suggestion)) !== null) {
            const [, fileName, content] = match;
            files[fileName.trim()] = content.trim();
        }

        return files;
    },

    async saveFiles(originalFilePath, files) {
        const originalDir = path.dirname(originalFilePath);

        for (const [fileName, content] of Object.entries(files)) {
            const filePath =
                fileName === path.basename(originalFilePath) ? originalFilePath : path.join(originalDir, fileName);
            await FileManager.write(filePath, content);
            console.log(chalk.green(`✅ Saved file: ${filePath}`));
        }
    },

    async optimizeAndRefactorFile(filePath, projectStructure) {
        console.log(chalk.cyan(`🔄 Optimizing and refactoring ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const fileExtension = path.extname(filePath);
        const language = this.getLanguageFromExtension(fileExtension);
        const languageConfig = CONFIG.languageConfigs[language];

        const prompt = `
Please optimize and refactor the following code from ${filePath}:

${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Language: ${language}
File extension: ${fileExtension}
Linter: ${languageConfig.linter}
Formatter: ${languageConfig.formatter}
Package manager: ${languageConfig.packageManager}

Focus on:
1. Improving code efficiency
2. Enhancing readability
3. Applying design patterns where appropriate
4. Reducing code duplication
5. Improving overall code structure
6. Ensuring consistency with the project structure
7. Reusing functionality from other modules
8. Following best practices and conventions for ${language}

Return the optimized and refactored code ONLY!! without explanations or comments or md formatting.
`;

        const spinner = ora("Optimizing and refactoring...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Optimization and refactoring completed");

            const optimizedCode = response.content[0].text;
            await FileManager.write(filePath, optimizedCode);
            console.log(chalk.green(`✅ ${filePath} has been optimized and refactored.`));
        } catch (error) {
            spinner.fail("Error optimizing and refactoring");
            throw error;
        }
    },

    getLanguageFromExtension(fileExtension) {
        for (const [language, config] of Object.entries(CONFIG.languageConfigs)) {
            if (config.fileExtensions.includes(fileExtension)) {
                return language;
            }
        }
        return "javascript";
    },

    async generateDependencyFile(language, projectStructure, readme) {
        const languageConfig = CONFIG.languageConfigs[language];
        let dependencyFileName;

        switch (languageConfig.packageManager) {
            case "npm":
                dependencyFileName = "package.json";
                break;
            case "pip":
                dependencyFileName = "requirements.txt";
                break;
            case "nuget":
                dependencyFileName = "ProjectName.csproj";
                break;
            case "maven":
                dependencyFileName = "pom.xml";
                break;
            case "bundler":
                dependencyFileName = "Gemfile";
                break;
            case "go mod":
                dependencyFileName = "go.mod";
                break;
            case "cargo":
                dependencyFileName = "Cargo.toml";
                break;
            case "composer":
                dependencyFileName = "composer.json";
                break;
            case "swift package manager":
                dependencyFileName = "Package.swift";
                break;
            default:
                console.log(chalk.red(`Unsupported package manager: ${languageConfig.packageManager}`));
                return;
        }

        console.log(chalk.cyan(`📦 Generating ${dependencyFileName} for ${language}...`));

        const prompt = `
Please generate a ${dependencyFileName} file for a ${language} project with the following structure:

${JSON.stringify(projectStructure, null, 2)}

README.md content:
${readme}

Include all necessary dependencies based on the project structure and features described in the README.md. Ensure the file is properly formatted and follows best practices for ${language} projects.

Return the content of the ${dependencyFileName} file without explanations or comments.
`;

        const spinner = ora(`Generating ${dependencyFileName}...`).start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed(`${dependencyFileName} generated successfully`);

            const dependencyFileContent = response.content[0].text;
            await FileManager.write(dependencyFileName, dependencyFileContent);
            console.log(chalk.green(`✅ Generated ${dependencyFileName}`));
        } catch (error) {
            spinner.fail(`Error generating ${dependencyFileName}`);
            throw error;
        }
    },

    async generateAIAgentCode(agentType, agentDescription, projectStructure, readme) {
        console.log(chalk.cyan(`🤖 Generating AI agent code for ${agentType}...`));

        const prompt = `
Please generate code for the ${agentType} AI agent based on the project structure and features described in the README.md. The agent should be able to perform its specific tasks as outlined in the README.

Agent description: ${agentDescription}

README.md content:
${readme}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the agent's functionality. Reuse existing modules and avoid duplicating code.

Return the generated code for the ${agentType} AI agent without explanations or comments. No formatting, just code.
`;

        const spinner = ora(`Generating ${agentType} AI agent code...`).start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed(`${agentType} AI agent code generated successfully`);

            const agentCode = response.content[0].text;
            const fileName = `./agents/${agentType.replace(/\s+/g, "")}.js`;
            await FileManager.write(fileName, agentCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail(`Error generating ${agentType} AI agent code`);
            throw error;
        }
    },

    async generateWorkflowCode(projectStructure) {
        console.log(chalk.cyan(`🔄 Generating AI agent workflow code...`));

        const prompt = `
Please generate code for managing the workflow and interactions between AI agents based on the project structure and features described in the README.md. The workflow should orchestrate the actions of different AI agents and ensure smooth communication between them.

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the workflow. Reuse existing modules and avoid duplicating code.

Return the generated code for the AI agent workflow without explanations or comments.
`;

        const spinner = ora("Generating AI agent workflow code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("AI agent workflow code generated successfully");

            const workflowCode = response.content[0].text;
            const fileName = "aiWorkflow.js";
            await FileManager.write(fileName, workflowCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail("Error generating AI agent workflow code");
            throw error;
        }
    },

    async generateLandingPage(projectStructure) {
        console.log(chalk.cyan("🌐 Generating landing page..."));

        const prompt = `
Please generate an HTML file for a landing page based on the project structure and features described in the README.md. The landing page should showcase the key features of the project and provide a visually appealing introduction.

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Use the following design guidelines:
- Responsive and mobile-friendly design
- Highlight key features and project information
- Include sections for pricing tiers
- Use a sleek design and creativity

Return the generated HTML code for the landing page without explanations or comments.
`;

        const spinner = ora("Generating landing page...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Landing page generated successfully");

            const landingPageCode = response.content[0].text;
            const fileName = "landing.html";
            await FileManager.write(fileName, landingPageCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail("Error generating landing page");
            throw error;
        }
    },

    async generateFullProject(readme, projectStructure) {
        console.log(chalk.cyan("🚀 Generating full project..."));

        const { language } = await UserInterface.promptForLanguage();
        await this.generateDependencyFile(language, projectStructure, readme);

        const files = Object.keys(projectStructure).filter(
            (file) => !file.includes(CONFIG.languageConfigs[language].dependencyFile)
        );

        for (const file of files) {
            const fileExtension = path.extname(file);
            const fileLanguage = this.getLanguageFromExtension(fileExtension);
            const languageConfig = CONFIG.languageConfigs[fileLanguage];

            if (languageConfig) {
                const content = await this.generate(readme, "", file, projectStructure, {});
                await FileManager.write(file, content);
                console.log(chalk.green(`✅ Generated ${file}`));

                await CodeAnalyzer.runLintChecks(file);
                await CodeAnalyzer.analyzeCodeQuality(file);
                await CodeAnalyzer.analyzePerformance(file);
                await CodeAnalyzer.checkSecurityVulnerabilities(file);
                await CodeAnalyzer.generateUnitTests(file, projectStructure);

                await DocumentationGenerator.generate(file, content, projectStructure);
            }
        }

        await UserInterface.runAIAgents(projectStructure, readme);
        await this.generateLandingPage(projectStructure);
        await DocumentationGenerator.generateProjectDocumentation(projectStructure);
        await DocumentationGenerator.generateAPIDocumentation(projectStructure);

        console.log(chalk.green("✅ Full project generated successfully"));
    },

    async handleLongRunningTasks(projectStructure) {
        console.log(chalk.cyan("🕒 Handling long-running tasks..."));

        const prompt = `
Please generate code for managing long-running AI agents based on the project structure. The code should handle:

1. Context management
2. Task scheduling
3. Progress tracking
4. Error handling and recovery
5. Resource management

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the long-running task management. Reuse existing modules and avoid duplicating code.

Return the generated code for managing long-running tasks without explanations or comments.
`;

        const spinner = ora("Generating long-running task management code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Long-running task management code generated successfully");

            const taskManagementCode = response.content[0].text;
            const fileName = "longRunningTaskManager.js";
            await FileManager.write(fileName, taskManagementCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail("Error generating long-running task management code");
            throw error;
        }
    },

    async generateSandboxEnvironment(projectStructure) {
        console.log(chalk.cyan("🏖️ Generating sandbox environment..."));

        const prompt = `
Please generate code for a version-controlled sandbox environment for AI-generated code based on the project structure. The sandbox should:

1. Create an isolated environment for testing AI-generated code
2. Implement version control using Git
3. Provide a mechanism for code review and approval
4. Allow for easy rollback of changes
5. Integrate with the main project workflow

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the sandbox environment. Reuse existing modules and avoid duplicating code.

Return the generated code for the sandbox environment without explanations or comments.
`;

        const spinner = ora("Generating sandbox environment code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Sandbox environment code generated successfully");

            const sandboxCode = response.content[0].text;
            const fileName = "sandboxEnvironment.js";
            await FileManager.write(fileName, sandboxCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail("Error generating sandbox environment code");
            throw error;
        }
    },

    async generateIterativeDevelopmentWorkflow(projectStructure) {
        console.log(chalk.cyan("🔄 Generating iterative development workflow..."));

        const prompt = `
Please generate code for an iterative development workflow that allows AI and human developers to work together seamlessly. The workflow should include:

1. A mechanism for AI to propose changes and improvements
2. A review process for human developers to assess AI-generated code
3. Integration with version control systems
4. Automated testing and validation of AI-generated code
5. A feedback loop for continuous improvement of AI-generated code

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Ensure the code is complete, functional, and follows best practices for JavaScript. Consider the project structure when implementing the iterative development workflow. Reuse existing modules and avoid duplicating code.

Return the generated code for the iterative development workflow without explanations or comments.
`;

        const spinner = ora("Generating iterative development workflow code...").start();

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: await UserInterface.getTemperature(),
                messages: [{ role: "user", content: prompt }],
            });

            spinner.succeed("Iterative development workflow code generated successfully");

            const workflowCode = response.content[0].text;
            const fileName = "iterativeDevelopmentWorkflow.js";
            await FileManager.write(fileName, workflowCode);
            console.log(chalk.green(`✅ Generated ${fileName}`));
        } catch (error) {
            spinner.fail("Error generating iterative development workflow code");
            throw error;
        }
    },
};

export default CodeGenerator;
