import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import ignore from "ignore";
import { CONFIG } from "./config.js";

const FileManager = {
    async read(filePath) {
        try {
            return await fs.readFile(filePath, "utf8");
        } catch (error) {
            console.error(chalk.red(`Error reading file ${filePath}:`), error);
            return null;
        }
    },

    async write(filePath, content) {
        try {
            await fs.writeFile(filePath, content, "utf8");
            console.log(chalk.green(`✅ File ${filePath} has been updated.`));
        } catch (error) {
            console.error(chalk.red(`❌ Error writing file ${filePath}:`), error);
        }
    },

    async createSubfolders(filePath) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
    },

    async getFilesToProcess() {
        const gitignorePath = path.join(process.cwd(), ".gitignore");
        const gitignoreContent = (await this.read(gitignorePath)) || "";
        const ig = ignore().add(gitignoreContent);
        const files = await fs.readdir(process.cwd(), { withFileTypes: true, recursive: true });
        return files
            .filter((file) => {
                const relativePath = path.relative(process.cwd(), path.join(file.path, file.name));
                return (
                    file.isFile() &&
                    !ig.ignores(relativePath) &&
                    !CONFIG.excludedFiles.includes(file.name) &&
                    !CONFIG.excludedDirs.some((dir) => relativePath.startsWith(dir)) &&
                    !CONFIG.excludedExtensions.includes(path.extname(file.name).toLowerCase())
                );
            })
            .map((file) => path.relative(process.cwd(), path.join(file.path, file.name)));
    },

    async getProjectStructure() {
        const files = await this.getFilesToProcess();
        return files.reduce((acc, file) => {
            const parts = file.split(path.sep);
            let current = acc;
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    current[part] = null;
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            });
            return acc;
        }, {});
    },
};

export default FileManager;
