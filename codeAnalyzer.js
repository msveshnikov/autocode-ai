import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import path from "path";
import inquirer from "inquirer";
import ora from "ora";
import fs from "fs/promises";
import { getResponse } from "./model.js";

const execAsync = promisify(exec);

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

        const response = await getResponse(prompt);

        await FileManager.write(filePath, response.content[0].text);
        console.log(chalk.green(`✅ Lint errors fixed for ${filePath}`));
        await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
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

        const response = await getResponse(prompt);

        console.log(chalk.green("📊 Project structure optimization suggestions:"));
        console.log(response.content[0].text);
        await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
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

        const response = await getResponse(prompt);

        console.log(chalk.green(`📊 Code quality analysis for ${filePath}:`));
        console.log(response.content[0].text);
        await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
    },

    async detectMissingDependencies(projectStructure) {
        console.log(chalk.cyan("🔍 Detecting missing dependencies..."));
        const packageContent = await this.getPackageFileContent(projectStructure);
        const prompt = `
    Analyze the following project structure and detect any missing dependencies or files:
    
    ${JSON.stringify(projectStructure, null, 2)}
    
    Dependencies graph:
    
    ${JSON.stringify(await this.analyzeDependencies(projectStructure), null, 2)}
    
    Package file content:
    ${packageContent}
    
    Please identify:
    1. Missing packages based on import statements for each supported language
    2. Missing files that are referenced but not present in the project structure (please always return filenames based on repo root)
    3. Potential circular dependencies
    4. Dependencies listed in the package file but not used in the project
    5. Dependencies used in the project but not listed in the package file
    
    Provide the results in a JSON code snippet.
    `;
        const response = await getResponse(prompt);

        console.log(chalk.green("📊 Missing dependencies analysis:"));
        console.log(response.content[0].text);
        await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);

        try {
            const structuredResults = JSON.parse(response.content?.[0]?.text?.match(/```json([\s\S]*?)```/)?.[1]);
            if (structuredResults) {
                await this.createMissingFiles(structuredResults?.missingFiles);
            }
        } catch {
            /* empty */
        }
    },

    async getPackageFileContent(projectStructure) {
        const packageFiles = [
            "package.json",
            "pom.xml",
            "build.gradle",
            "Gemfile",
            "go.mod",
            "Cargo.toml",
            "composer.json",
            "Package.swift",
            "pubspec.yaml",
        ];

        for (const file of packageFiles) {
            const matchingFile = Object.keys(projectStructure).find((key) => key.match(new RegExp(file)));
            if (matchingFile) {
                return await FileManager.read(matchingFile);
            }
        }

        return "No package file found";
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
            case "java":
                return this.extractJavaDependencies(content);
            case "ruby":
                return this.extractRubyDependencies(content);
            case "go":
                return this.extractGoDependencies(content);
            case "rust":
                return this.extractRustDependencies(content);
            case "php":
                return this.extractPHPDependencies(content);
            case "swift":
                return this.extractSwiftDependencies(content);
            case "kotlin":
                return this.extractKotlinDependencies(content);
            case "dart":
                return this.extractDartDependencies(content);
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

    extractJavaDependencies(content) {
        const importRegex = /import\s+([^;]+);/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            dependencies.push(match[1].trim().split(".")[0]);
        }
        return [...new Set(dependencies)];
    },

    extractRubyDependencies(content) {
        const requireRegex = /(?:require|require_relative)\s+['"]([^'"]+)['"]/g;
        const dependencies = [];
        let match;
        while ((match = requireRegex.exec(content)) !== null) {
            dependencies.push(match[1]);
        }
        return dependencies;
    },

    extractGoDependencies(content) {
        const importRegex = /import\s+(?:\(\s*|\s*)([^)]+)(?:\s*\)|\s*)/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const imports = match[1].split("\n");
            for (const imp of imports) {
                const trimmed = imp.trim();
                if (trimmed) {
                    dependencies.push(trimmed.split(/\s+/)[0].replace(/"/g, ""));
                }
            }
        }
        return dependencies;
    },

    extractRustDependencies(content) {
        const useRegex = /use\s+([^:;]+)(?:::.*)?;/g;
        const dependencies = [];
        let match;
        while ((match = useRegex.exec(content)) !== null) {
            dependencies.push(match[1]);
        }
        return [...new Set(dependencies)];
    },

    extractPHPDependencies(content) {
        const useRegex = /use\s+([^;]+);/g;
        const dependencies = [];
        let match;
        while ((match = useRegex.exec(content)) !== null) {
            dependencies.push(match[1].split("\\")[0]);
        }
        return [...new Set(dependencies)];
    },

    extractSwiftDependencies(content) {
        const importRegex = /import\s+(\w+)/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            dependencies.push(match[1]);
        }
        return dependencies;
    },

    extractKotlinDependencies(content) {
        const importRegex = /import\s+([^;\n]+)/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            dependencies.push(match[1].split(".")[0]);
        }
        return [...new Set(dependencies)];
    },

    extractDartDependencies(content) {
        const importRegex = /import\s+['"]([^'"]+)['"]/g;
        const dependencies = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            dependencies.push(match[1].split("/")[0]);
        }
        return [...new Set(dependencies)];
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
        if (!path.extname(filePath)) {
            filePath += ".js";
        }
        const fileExists = await fs
            .access(filePath)
            .then(() => true)
            .catch(() => false);
        if (!fileExists) {
            await FileManager.write(filePath, "");
            console.log(chalk.green(`✅ New file ${filePath} has been created.`));
        } else {
            console.log(chalk.yellow(`⚠️ File ${filePath} already exists. Skipping creation.`));
        }
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

    async analyzePerformance(filePath) {
        console.log(chalk.cyan(`🚀 Analyzing performance for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const fileExtension = path.extname(filePath);
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        const prompt = `
Analyze the following ${language} code for performance optimizations:

${fileContent}

Please consider:
1. Algorithmic complexity
2. Memory usage
3. I/O operations
4. Asynchronous operations (if applicable)
5. ${language}-specific performance best practices

Provide detailed performance optimization suggestions in a structured format.
`;

        const response = await getResponse(prompt);

        console.log(chalk.green(`📊 Performance analysis for ${filePath}:`));
        console.log(response.content[0].text);
        await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
    },

    async checkSecurityVulnerabilities(filePath) {
        console.log(chalk.cyan(`🔒 Checking security vulnerabilities for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const fileExtension = path.extname(filePath);
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        const prompt = `
Analyze the following ${language} code for potential security vulnerabilities:

${fileContent}

Please consider:
1. Input validation and sanitization
2. Authentication and authorization issues
3. Data exposure risks
4. Cross-site scripting (XSS) vulnerabilities
5. SQL injection risks (if applicable)
6. ${language}-specific security best practices

Provide detailed security vulnerability analysis and suggestions in a structured format.
`;

        const response = await getResponse(prompt);

        console.log(chalk.green(`📊 Security vulnerability analysis for ${filePath}:`));
        console.log(response.content[0].text);
        await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
    },

    async generateUnitTests(filePath, projectStructure) {
        console.log(chalk.cyan(`🧪 Generating unit tests for ${filePath}...`));
        const fileContent = await FileManager.read(filePath);
        const fileExtension = path.extname(filePath);
        const language = Object.keys(CONFIG.languageConfigs).find((lang) =>
            CONFIG.languageConfigs[lang].fileExtensions.includes(fileExtension)
        );

        const prompt = `
Generate unit tests for the following ${language} code:

${fileContent}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

Please consider:
1. Testing all public functions and methods
2. Covering edge cases and error scenarios
3. Mocking external dependencies
4. Achieving high code coverage
5. Following ${language}-specific testing best practices

Provide the generated unit tests in a text code format, ready to be saved in a separate test file. Do not include any explanations or comments in your response, just provide the code. Don't use md formatting or code snippets. Just code text
`;

        const spinner = ora("Generating unit tests...").start();

        try {
            const response = await getResponse(prompt);
            spinner.succeed("Unit tests generated");
            const testFilePath = filePath.replace(/\.js$/, ".test.js");
            await FileManager.write(testFilePath, response.content[0].text);
            console.log(chalk.green(`✅ Unit tests generated and saved to ${testFilePath}`));
            await CodeGenerator.calculateTokenStats(response.usage.input_tokens, response.usage.output_tokens);
        } catch (error) {
            spinner.fail("Error generating unit tests");
            console.error(chalk.red(`Error: ${error.message}`));
        }
    },
};

export default CodeAnalyzer;
