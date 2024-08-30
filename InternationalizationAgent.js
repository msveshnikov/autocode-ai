import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import FileManager from "./fileManager.js";

const InternationalizationAgent = {
    async run(projectStructure) {
        console.log(chalk.cyan("🌐 Running Internationalization Agent..."));

        const supportedLanguages = ["en", "es", "fr", "de", "ja", "zh"];
        const localesDir = path.join(process.cwd(), "locales");

        await this.createLocalesDirectory(localesDir);
        await this.generateLanguageFiles(localesDir, supportedLanguages);
        await this.updateConfigFile(supportedLanguages);
        await this.updateMainFile();
        await this.updateComponents(projectStructure);
        await this.generateLanguageSwitcher();

        console.log(chalk.green("✅ Internationalization implemented successfully."));
    },

    async createLocalesDirectory(localesDir) {
        try {
            await fs.mkdir(localesDir, { recursive: true });
            console.log(chalk.green(`Created locales directory: ${localesDir}`));
        } catch (error) {
            console.error(chalk.red(`Error creating locales directory: ${error.message}`));
        }
    },

    async generateLanguageFiles(localesDir, languages) {
        for (const lang of languages) {
            const filePath = path.join(localesDir, `${lang}.json`);
            const content = JSON.stringify({ greeting: `Hello in ${lang}` }, null, 2);
            await FileManager.write(filePath, content);
        }
    },

    async updateConfigFile(languages) {
        const configPath = path.join(process.cwd(), "config.js");
        const configContent = await FileManager.read(configPath);
        const updatedContent = configContent.replace(
            /export const CONFIG = {/,
            `export const CONFIG = {\n  supportedLanguages: ${JSON.stringify(languages)},`
        );
        await FileManager.write(configPath, updatedContent);
    },

    async updateMainFile() {
        const mainFilePath = path.join(process.cwd(), "index.js");
        const mainContent = await FileManager.read(mainFilePath);
        const i18nSetup = `
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { CONFIG } from './config.js';

i18next
  .use(Backend)
  .init({
    fallbackLng: 'en',
    supportedLngs: CONFIG.supportedLanguages,
    backend: {
      loadPath: './locales/{{lng}}.json'
    }
  });
`;
        const updatedContent = i18nSetup + mainContent;
        await FileManager.write(mainFilePath, updatedContent);
    },

    async updateComponents(projectStructure) {
        const files = await FileManager.getFilesToProcess();
        for (const file of files) {
            if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
                const content = await FileManager.read(file);
                const updatedContent = this.addI18nToComponent(content);
                await FileManager.write(file, updatedContent);
            }
        }
    },

    addI18nToComponent(content) {
        const i18nImport = "import { useTranslation } from 'react-i18next';";
        const i18nHook = "const { t } = useTranslation();";
        let updatedContent = content;

        if (!content.includes(i18nImport)) {
            updatedContent = i18nImport + "\n" + updatedContent;
        }

        if (!content.includes(i18nHook)) {
            const functionBodyRegex = /function.*?{|const.*?=.*?{|class.*?{/;
            updatedContent = updatedContent.replace(functionBodyRegex, (match) => `${match}\n  ${i18nHook}`);
        }

        updatedContent = updatedContent.replace(/(['"])(.+?)(['"])/g, (match, p1, p2) => `{t('${p2}')}`);

        return updatedContent;
    },

    async generateLanguageSwitcher() {
        const content = `
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from './config.js';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      {CONFIG.supportedLanguages.map((lng) => (
        <button key={lng} onClick={() => changeLanguage(lng)}>
          {lng}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
`;
        const filePath = path.join(process.cwd(), "components", "LanguageSwitcher.js");
        await FileManager.createSubfolders(filePath);
        await FileManager.write(filePath, content);
    },

    async updateREADME(projectStructure) {
        const readmePath = path.join(process.cwd(), "README.md");
        const readmeContent = await FileManager.read(readmePath);
        const updatedContent =
            readmeContent +
            "\n\n## Internationalization\n\nThis project supports multiple languages. Use the `LanguageSwitcher` component to change the language at runtime.";
        await FileManager.write(readmePath, updatedContent);
    },

    async updatePackageJSON() {
        const packagePath = path.join(process.cwd(), "package.json");
        const packageContent = await FileManager.read(packagePath);
        const packageJSON = JSON.parse(packageContent);
        packageJSON.dependencies = {
            ...packageJSON.dependencies,
            i18next: "^21.8.0",
            "i18next-fs-backend": "^1.1.5",
            "react-i18next": "^11.17.0",
        };
        await FileManager.write(packagePath, JSON.stringify(packageJSON, null, 2));
    },
};

export default InternationalizationAgent;
