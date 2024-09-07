import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import CodeAnalyzer from "./codeAnalyzer.js";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

class TesterAgent {
    constructor() {
        this.testsDirectory = "tests";
    }

    async run(projectStructure, readme) {
        console.log("Starting Tester Agent...");
        await this.generateIntegrationTests(projectStructure, readme);
        await this.generateUnitTests(projectStructure, readme);
        await this.runTests();
        await this.optimizeTests();
        console.log("Tester Agent completed.");
    }

    async generateIntegrationTests(projectStructure, readme) {
        const endpoints = await this.extractEndpoints(projectStructure);

        for (const endpoint of endpoints) {
            await this.generateTestForEndpoint(endpoint, projectStructure, readme);
        }
    }

    async extractEndpoints(projectStructure) {
        const serverFiles = Object.keys(projectStructure.server?.routes || {});
        const endpoints = [];

        for (const file of serverFiles) {
            const filePath = path.join(process.cwd(), "server", "routes", file);
            const content = await FileManager.read(filePath);
            const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g);

            if (routeMatches) {
                for (const match of routeMatches) {
                    const [, method, route] = match.match(
                        /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/
                    );
                    endpoints.push({ method, route, file });
                }
            }
        }

        return endpoints;
    }

    async generateTestForEndpoint(endpoint, projectStructure, readme) {
        const prompt = `
Generate an integration test for the following endpoint:
Method: ${endpoint.method}
Route: ${endpoint.route}
File: ${endpoint.file}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

README.md content:
${readme}

Generate a complete Jest test file for this endpoint. Include necessary imports, setup, and teardown. Use supertest for making HTTP requests. Ensure proper error handling and edge cases are covered. The test should be comprehensive and follow best practices for API testing.
`;

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            const testContent = this.extractCodeSnippet(response.content[0].text);
            const testFileName = `${endpoint.file.replace(".js", "")}.test.js`;
            const testFilePath = path.join(process.cwd(), this.testsDirectory, testFileName);

            await FileManager.createSubfolders(testFilePath);
            await FileManager.write(testFilePath, testContent);

            console.log(`Generated test file: ${testFilePath}`);
        } catch (error) {
            console.error(`Error generating test for ${endpoint.method} ${endpoint.route}:`, error);
        }
    }

    async generateUnitTests(projectStructure, readme) {
        const files = await FileManager.getFilesToProcess();
        for (const file of files) {
            if (file.endsWith(".js") && !file.endsWith(".test.js")) {
                await this.generateUnitTestForFile(file, projectStructure, readme);
            }
        }
    }

    async generateUnitTestForFile(file, projectStructure, readme) {
        const content = await FileManager.read(file);
        const prompt = `
Generate unit tests for the following file:
File: ${file}

File content:
${content}

Project structure:
${JSON.stringify(projectStructure, null, 2)}

README.md content:
${readme}

Generate a complete Jest test file for this module. Include necessary imports, mocks, and test cases. Ensure good test coverage and consider edge cases. The tests should be comprehensive and follow best practices for unit testing.
`;

        try {
            const response = await anthropic.messages.create({
                model: CONFIG.anthropicModel,
                max_tokens: CONFIG.maxTokens,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }],
            });

            const testContent = this.extractCodeSnippet(response.content[0].text);
            const testFileName = `${path.basename(file, ".js")}.test.js`;
            const testFilePath = path.join(process.cwd(), this.testsDirectory, testFileName);

            await FileManager.createSubfolders(testFilePath);
            await FileManager.write(testFilePath, testContent);

            console.log(`Generated unit test file: ${testFilePath}`);
        } catch (error) {
            console.error(`Error generating unit tests for ${file}:`, error);
        }
    }

    async runTests() {
        try {
            const { stdout, stderr } = await CodeAnalyzer.runCommand("npm test");
            console.log("Test results:");
            console.log(stdout);
            if (stderr) {
                console.error("Test errors:");
                console.error(stderr);
            }
        } catch (error) {
            console.error("Error running tests:", error);
        }
    }

    async optimizeTests() {
        const testFiles = await FileManager.getFilesInDirectory(this.testsDirectory, ".test.js");
        for (const testFile of testFiles) {
            const content = await FileManager.read(testFile);
            const optimizedContent = await CodeGenerator.optimizeAndRefactorFile(testFile, content);
            await FileManager.write(testFile, optimizedContent);
        }
    }

    extractCodeSnippet(text) {
        const codeBlockRegex = /```(?:javascript|js)?\n([\s\S]*?)\n```/;
        const match = text.match(codeBlockRegex);
        return match ? match[1] : text;
    }
}

export default new TesterAgent();
