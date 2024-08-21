# Config.js Documentation

## Overview

The `config.js` file contains the main configuration object (`CONFIG`) for the AutoCode project. This file defines various settings, parameters, and configurations used throughout the application. It plays a crucial role in centralizing and managing the project's configuration in one place.

## CONFIG Object

The `CONFIG` object is exported as a constant and contains the following key sections:

### General Settings

-   `licenseServerUrl`: The URL of the license server API.
-   `excludedFiles`: An array of filenames to be excluded from processing.
-   `excludedDirs`: An array of directory names to be excluded from processing.
-   `excludedExtensions`: An array of file extensions to be excluded from processing.
-   `anthropicModel`: The specific Anthropic AI model to be used.
-   `maxTokens`: The maximum number of tokens allowed for AI processing.
-   `maxFileLines`: The maximum number of lines allowed in a file for processing.

### Language Configurations

The `languageConfigs` object contains settings for different programming languages supported by the project:

-   `javascript`
-   `python`
-   `csharp`

Each language configuration includes:

-   `fileExtensions`: Array of file extensions associated with the language.
-   `linter`: The linting tool used for the language.
-   `formatter`: The code formatting tool used for the language.
-   `packageManager`: The package management tool used for the language.

### AI Agents

The `aiAgents` object defines various AI agents used in the project, each with a `name` and `description`:

-   `sqlMigrations`
-   `services`
-   `apiRoutes`
-   `tester`
-   `projectManager`
-   `redditPromotion`

## Usage

To use the configuration in other parts of the project, import the `CONFIG` object:

```javascript
import { CONFIG } from "./config.js";

// Example: Accessing the license server URL
const serverUrl = CONFIG.licenseServerUrl;

// Example: Checking if a file should be excluded
const shouldExclude = CONFIG.excludedFiles.includes("someFile.txt");

// Example: Getting the linter for JavaScript
const jsLinter = CONFIG.languageConfigs.javascript.linter;

// Example: Accessing an AI agent's description
const testerDescription = CONFIG.aiAgents.tester.description;
```

## Role in the Project

Given the project structure, `config.js` likely interacts with several other components:

-   `codeAnalyzer.js` and `codeGenerator.js` may use language configurations and excluded file settings.
-   `licenseManager.js` would use the `licenseServerUrl`.
-   `documentationGenerator.js` might reference language-specific settings.
-   `fileManager.js` would use file exclusion settings.
-   `index.js` could import and distribute configuration settings to other modules.
-   `userInterface.js` might use AI agent information for display purposes.
-   The server's `license-server.js` would likely reference the `licenseServerUrl`.

## Maintenance

When updating the project's configuration, modify this file to ensure changes are reflected across the entire application. Be cautious when changing critical settings like `licenseServerUrl` or `anthropicModel`, as they may impact the core functionality of the AutoCode system.
