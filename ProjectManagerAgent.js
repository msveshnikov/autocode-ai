import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import CodeAnalyzer from "./codeAnalyzer.js";
import DevOpsAgent from "./DevOpsAgent.js";
import InternationalizationAgent from "./InternationalizationAgent.js";
import RedditPromotionAgent from "./RedditPromotionAgent.js";
import TesterAgent from "./TesterAgent.js";

const execPromise = util.promisify(exec);

class ProjectManagerAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    async orchestrateWork() {
        await this.updateDependencies();
        await this.runTests();
        await this.buildApp();
        await this.performUIChecks();
        await this.runDevOpsAgent();
        await this.runInternationalizationAgent();
        await this.runRedditPromotionAgent();
        await this.runTesterAgent();
    }

    async updateDependencies() {
        const packageJsonPath = path.join(this.projectRoot, "package.json");
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

        for (const [dep, version] of Object.entries(packageJson.dependencies)) {
            if (version.startsWith("^") || version.startsWith("~")) {
                await execPromise(`npm update ${dep}`);
            }
        }
    }

    async runTests() {
        try {
            await execPromise("npm test");
        } catch (error) {
            console.error("Tests failed:", error.stderr);
            throw new Error("Tests failed");
        }
    }

    async buildApp() {
        try {
            await execPromise("npm run build");
        } catch (error) {
            console.error("Build failed:", error.stderr);
            throw new Error("Build failed");
        }
    }

    async generateNewComponent(componentName) {
        const componentContent = await CodeGenerator.generateUIComponent(componentName);
        const componentPath = path.join(this.projectRoot, "src", "components", `${componentName}.jsx`);
        await FileManager.write(componentPath, componentContent);
    }

    async optimizePerformance() {
        const files = await FileManager.getFilesToProcess();
        for (const file of files) {
            const content = await FileManager.read(file);
            const optimizedContent = await CodeGenerator.optimizePerformance(content);
            await FileManager.write(file, optimizedContent);
        }
    }

    async generateDocumentation() {
        const readmePath = path.join(this.projectRoot, "README.md");
        const readme = await FileManager.read(readmePath);
        const projectStructure = await FileManager.getProjectStructure();
        const updatedReadme = await CodeGenerator.updateReadme(readme, projectStructure);
        await FileManager.write(readmePath, updatedReadme);
    }

    async monitorResourceUsage() {
        const usage = process.memoryUsage();
        console.log("Memory usage:", {
            rss: `${Math.round((usage.rss / 1024 / 1024) * 100) / 100} MB`,
            heapTotal: `${Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100} MB`,
            heapUsed: `${Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100} MB`,
            external: `${Math.round((usage.external / 1024 / 1024) * 100) / 100} MB`,
        });
    }

    async checkCodeQuality() {
        const files = await FileManager.getFilesToProcess();
        for (const file of files) {
            const issues = await CodeAnalyzer.analyzeCodeQuality(file);
            if (issues.length > 0) {
                console.log(`Code quality issues found in ${file}:`);
                issues.forEach((issue) => console.log(`- ${issue}`));
                await this.fixCodeQualityIssues(file, issues);
            }
        }
    }

    async fixCodeQualityIssues(file, issues) {
        const content = await FileManager.read(file);
        const fixedContent = await CodeGenerator.fixCodeQualityIssues(content, issues);
        await FileManager.write(file, fixedContent);
    }

    async runSecurityAudit() {
        try {
            const { stdout } = await execPromise("npm audit");
            console.log("Security audit results:", stdout);
        } catch (error) {
            console.error("Security audit failed:", error.stderr);
        }
    }

    async deployApplication() {
        try {
            await execPromise("npm run deploy");
            console.log("Application deployed successfully");
        } catch (error) {
            console.error("Deployment failed:", error.stderr);
            throw new Error("Deployment failed");
        }
    }

    async backupProject() {
        const backupDir = path.join(this.projectRoot, "backups");
        await fs.mkdir(backupDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = path.join(backupDir, `backup-${timestamp}.zip`);
        await execPromise(`zip -r ${backupPath} . -x "node_modules/*" "*/.git/*"`);
        console.log(`Project backed up to ${backupPath}`);
    }

    async runDevOpsAgent() {
        await DevOpsAgent.run();
    }

    async runInternationalizationAgent() {
        const projectStructure = await FileManager.getProjectStructure();
        const readme = await FileManager.read(path.join(this.projectRoot, "README.md"));
        await InternationalizationAgent.run(projectStructure, readme);
    }

    async runRedditPromotionAgent() {
        await RedditPromotionAgent.initialize();
        await RedditPromotionAgent.runPromotionCampaign();
    }

    async runTesterAgent() {
        const projectStructure = await FileManager.getProjectStructure();
        const readme = await FileManager.read(path.join(this.projectRoot, "README.md"));
        await TesterAgent.run(projectStructure, readme);
    }

    async performUIChecks() {
        console.log("Performing UI checks...");
    }

    async run() {
        try {
            await this.orchestrateWork();
            await this.checkCodeQuality();
            await this.optimizePerformance();
            await this.generateDocumentation();
            await this.runSecurityAudit();
            await this.monitorResourceUsage();
            await this.backupProject();
            await this.deployApplication();
            console.log("Project Manager Agent tasks completed successfully");
        } catch (error) {
            console.error("Project Manager Agent encountered an error:", error);
        }
    }
}

export default new ProjectManagerAgent();
