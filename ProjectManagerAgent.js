import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import chalk from "chalk";
import FileManager from "./fileManager.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import TesterAgent from "./TesterAgent.js";
import DevOpsAgent from "./DevOpsAgent.js";

const execPromise = util.promisify(exec);

const ProjectManagerAgent = {
    async run(projectStructure, readme) {
        console.log(chalk.cyan("🚀 Project Manager Agent starting..."));

        await this.orchestrateAgents(projectStructure, readme);
        await this.buildApp();
        await this.runTests();
        await this.performUIChecks();

        console.log(chalk.green("✅ Project Manager Agent completed its tasks."));
    },

    async orchestrateAgents(projectStructure, readme) {
        console.log(chalk.yellow("Orchestrating other agents..."));

        await TesterAgent.run(projectStructure, readme);
        await DevOpsAgent.run(projectStructure, readme);
    },

    async buildApp() {
        console.log(chalk.yellow("Building the application..."));

        try {
            const { stdout, stderr } = await execPromise("npm run build");
            console.log(chalk.green("Build output:"), stdout);
            if (stderr) {
                console.error(chalk.red("Build errors:"), stderr);
            }
        } catch (error) {
            console.error(chalk.red("Error building the application:"), error);
        }
    },

    async runTests() {
        console.log(chalk.yellow("Running tests..."));

        try {
            const { stdout, stderr } = await execPromise("npm test");
            console.log(chalk.green("Test output:"), stdout);
            if (stderr) {
                console.error(chalk.red("Test errors:"), stderr);
            }
        } catch (error) {
            console.error(chalk.red("Error running tests:"), error);
        }
    },

    async performUIChecks() {
        console.log(chalk.yellow("Performing basic UI checks..."));

        const uiFiles = await this.findUIFiles();
        for (const file of uiFiles) {
            await this.checkUIFile(file);
        }
    },

    async findUIFiles() {
        const files = await FileManager.getFilesToProcess();
        return files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return [".html", ".js", ".jsx", ".ts", ".tsx"].includes(ext);
        });
    },

    async checkUIFile(file) {
        console.log(chalk.blue(`Checking UI file: ${file}`));

        const content = await FileManager.read(file);
        const issues = await CodeAnalyzer.analyzeUICode(content);

        if (issues.length > 0) {
            console.log(chalk.yellow(`UI issues found in ${file}:`));
            issues.forEach((issue) => console.log(chalk.yellow(`- ${issue}`)));
        } else {
            console.log(chalk.green(`No UI issues found in ${file}`));
        }
    },

    async generateBuildScript() {
        console.log(chalk.yellow("Generating build script..."));

        const buildScript = `
#!/bin/bash

set -e

echo "Installing dependencies..."
npm install

echo "Running linter..."
npm run lint

echo "Running tests..."
npm test

echo "Building the application..."
npm run build

echo "Build completed successfully!"
    `.trim();

        await FileManager.write("build.sh", buildScript);
        await fs.chmod("build.sh", "755");
        console.log(chalk.green("Build script generated: build.sh"));
    },

    async checkDependencies() {
        console.log(chalk.yellow("Checking project dependencies..."));

        try {
            const { stdout, stderr } = await execPromise("npm outdated --json");
            if (stdout) {
                const outdatedDeps = JSON.parse(stdout);
                if (Object.keys(outdatedDeps).length > 0) {
                    console.log(chalk.yellow("Outdated dependencies found:"));
                    for (const [dep, info] of Object.entries(outdatedDeps)) {
                        console.log(chalk.yellow(`- ${dep}: ${info.current} -> ${info.latest}`));
                    }
                } else {
                    console.log(chalk.green("All dependencies are up to date."));
                }
            }
            if (stderr) {
                console.error(chalk.red("Error checking dependencies:"), stderr);
            }
        } catch (error) {
            console.error(chalk.red("Error checking dependencies:"), error);
        }
    },

    async optimizeAssets() {
        console.log(chalk.yellow("Optimizing assets..."));

        const assetExtensions = [".jpg", ".jpeg", ".png", ".svg", ".gif"];
        const files = await FileManager.getFilesToProcess();
        const assetFiles = files.filter((file) => assetExtensions.includes(path.extname(file).toLowerCase()));

        for (const file of assetFiles) {
            console.log(chalk.blue(`Optimizing asset: ${file}`));
            try {
                if (path.extname(file).toLowerCase() === ".svg") {
                    await this.optimizeSVG(file);
                } else {
                    await this.optimizeImage(file);
                }
            } catch (error) {
                console.error(chalk.red(`Error optimizing ${file}:`), error);
            }
        }
    },

    async optimizeSVG(file) {
        const { stdout, stderr } = await execPromise(`svgo ${file}`);
        if (stdout) console.log(chalk.green(stdout));
        if (stderr) console.error(chalk.red(stderr));
    },

    async optimizeImage(file) {
        const { stdout, stderr } = await execPromise(`imagemin ${file} --out-dir=./optimized`);
        if (stdout) console.log(chalk.green(stdout));
        if (stderr) console.error(chalk.red(stderr));
    },

    async monitorPerformance() {
        console.log(chalk.yellow("Monitoring application performance..."));

        try {
            const { stdout, stderr } = await execPromise("node --prof app.js");
            if (stdout) console.log(chalk.green("Performance data collected."));
            if (stderr) console.error(chalk.red("Error collecting performance data:"), stderr);

            await execPromise("node --prof-process isolate-*-v8.log > processed.txt");
            console.log(chalk.green("Performance data processed. Check processed.txt for results."));
        } catch (error) {
            console.error(chalk.red("Error monitoring performance:"), error);
        }
    },

    async generateDockerfile() {
        console.log(chalk.yellow("Generating Dockerfile..."));

        const dockerfileContent = `
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
    `.trim();

        await FileManager.write("Dockerfile", dockerfileContent);
        console.log(chalk.green("Dockerfile generated."));
    },

    async setupCICD() {
        console.log(chalk.yellow("Setting up CI/CD configuration..."));

        const githubWorkflowContent = `
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
    `.trim();

        await FileManager.write(".github/workflows/ci-cd.yml", githubWorkflowContent);
        console.log(chalk.green("GitHub Actions workflow configured."));
    },

    async generateChangeLog() {
        console.log(chalk.yellow("Generating changelog..."));

        try {
            const { stdout, stderr } = await execPromise('git log --pretty=format:"%h - %s (%cr)" --abbrev-commit');
            if (stdout) {
                await FileManager.write("CHANGELOG.md", `# Changelog\n\n${stdout}`);
                console.log(chalk.green("Changelog generated: CHANGELOG.md"));
            }
            if (stderr) console.error(chalk.red("Error generating changelog:"), stderr);
        } catch (error) {
            console.error(chalk.red("Error generating changelog:"), error);
        }
    },

    async setupEnvironmentConfig() {
        console.log(chalk.yellow("Setting up environment configuration..."));

        const envExampleContent = `
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=your_jwt_secret_here
    `.trim();

        await FileManager.write(".env.example", envExampleContent);
        console.log(chalk.green(".env.example file created."));
        console.log(chalk.yellow("Remember to create a .env file with your actual configuration."));
    },
};

export default ProjectManagerAgent;
