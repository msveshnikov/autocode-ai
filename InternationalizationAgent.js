import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import FileManager from "./fileManager.js";

const InternationalizationAgent = {
    async run(projectStructure, readme) {
        console.log(chalk.cyan("🌐 Running Internationalization Agent..."));

        const supportedLanguages = await this.getSupportedLanguages();
        const stringFiles = await this.findStringFiles(projectStructure);

        for (const file of stringFiles) {
            await this.internationalizeFile(file, supportedLanguages);
        }

        await this.generateLanguageSelectionComponent(supportedLanguages);
        await this.updateReadmeWithI18nInfo(readme, supportedLanguages);

        console.log(chalk.green("✅ Internationalization completed successfully."));
    },

    async getSupportedLanguages() {
        const defaultLanguages = ["en", "es", "fr", "de", "ja"];
        try {
            const configPath = path.join(process.cwd(), "i18n.config.json");
            const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
            return config.supportedLanguages || defaultLanguages;
        } catch {
            console.log(chalk.yellow("No i18n.config.json found. Using default languages."));
            return defaultLanguages;
        }
    },

    async findStringFiles(projectStructure) {
        const stringFiles = [];
        const queue = [{ structure: projectStructure, path: "" }];

        while (queue.length > 0) {
            const { structure, path } = queue.shift();
            for (const [name, value] of Object.entries(structure)) {
                const fullPath = path ? `${path}/${name}` : name;
                if (value === null && name.endsWith(".js")) {
                    const content = await FileManager.read(fullPath);
                    if (content.includes("export const strings") || content.includes("export default {")) {
                        stringFiles.push(fullPath);
                    }
                } else if (typeof value === "object") {
                    queue.push({ structure: value, path: fullPath });
                }
            }
        }

        return stringFiles;
    },

    async internationalizeFile(file, languages) {
        const content = await FileManager.read(file);
        const strings = this.extractStrings(content);
        const i18nStrings = this.createI18nStrings(strings, languages);
        const updatedContent = this.updateFileContent(content, i18nStrings);
        await FileManager.write(file, updatedContent);
    },

    extractStrings(content) {
        const stringRegex = /['"`](.*?)['"`]/g;
        const matches = content.match(stringRegex);
        return matches ? matches.map((m) => m.slice(1, -1)) : [];
    },

    createI18nStrings(strings, languages) {
        const i18nStrings = {};
        for (const lang of languages) {
            i18nStrings[lang] = {};
            for (const str of strings) {
                i18nStrings[lang][str] = str;
            }
        }
        return i18nStrings;
    },

    updateFileContent(content, i18nStrings) {
        return `
import i18next from 'i18next';

const strings = ${JSON.stringify(i18nStrings, null, 2)};

export const t = (key, lang = i18next.language) => {
  return strings[lang][key] || key;
};

export default strings;
`;
    },

    async generateLanguageSelectionComponent(languages) {
        const componentContent = `
import React from 'react';
import i18next from 'i18next';

const LanguageSelector = () => {
  const changeLanguage = (lng) => {
    i18next.changeLanguage(lng);
  };

  return (
    <div>
      {${JSON.stringify(languages)}.map((lang) => (
        <button key={lang} onClick={() => changeLanguage(lang)}>
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
`;

        await FileManager.write("src/components/LanguageSelector.js", componentContent);
    },

    async updateReadmeWithI18nInfo(readme, languages) {
        const i18nSection = `
## Internationalization

This project supports the following languages:

${languages.map((lang) => `- ${lang.toUpperCase()}`).join("\n")}

To add or modify translations, update the string files in the \`src/i18n\` directory.

To change the language at runtime, use the \`LanguageSelector\` component or call \`i18next.changeLanguage(lang)\`.
`;

        const updatedReadme = readme + "\n" + i18nSection;
        await FileManager.write("README.md", updatedReadme);
    },
};

export default InternationalizationAgent;
