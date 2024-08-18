# CodeCraftAI Documentation

## Overview

CodeCraftAI is an automated coding tool that helps developers generate, update, and optimize code based on project requirements specified in a README.md file. It uses the Anthropic AI model to assist with various coding tasks, including file generation, code optimization, documentation creation, and project structure analysis.

## Table of Contents

1. [Configuration](#configuration)
2. [Main Components](#main-components)
3. [Utility Functions](#utility-functions)
4. [Main Execution Flow](#main-execution-flow)

## Configuration

The `CONFIG` object contains various settings for the application:

```javascript
const CONFIG = {
    excludedFiles: ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"],
    excludedDirs: [".git", "node_modules"],
    excludedExtensions: [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"],
    anthropicModel: "claude-3-5-sonnet-20240620",
    maxTokens: 8192,
};
```

## Main Components

### FileManager

Handles file system operations.

#### Methods:

- `read(filePath)`: Reads the content of a file.
- `write(filePath, content)`: Writes content to a file.
- `createSubfolders(filePath)`: Creates necessary subfolders for a given file path.
- `getFilesToProcess()`: Returns a list of files to be processed, excluding those specified in the configuration.

### CodeGenerator

Generates and updates code using the Anthropic AI model.

#### Methods:

- `generate(readme, currentCode, fileName, temperature)`: Generates or updates code for a given file.
- `updateReadme(readme, temperature)`: Updates the README.md file with new design ideas.

### CodeAnalyzer

Analyzes and improves code quality.

#### Methods:

- `runLintChecks(filePath)`: Runs ESLint on a file.
- `fixLintErrors(filePath, lintOutput)`: Attempts to fix lint errors using AI.
- `detectSecurityVulnerabilities()`: Runs npm audit to detect security vulnerabilities.
- `optimizeProjectStructure()`: Analyzes and suggests optimizations for the project structure.

### DocumentationGenerator

Generates documentation for code files.

#### Methods:

- `generate(filePath, content)`: Generates documentation for a given file.

### UserInterface

Handles user interactions and prompts.

#### Methods:

- `promptForAction()`: Prompts the user to choose an action.
- `promptForFiles(files)`: Prompts the user to select files for processing.
- `promptForNewFile()`: Prompts the user to enter a new file name.
- `promptForTemperature()`: Prompts the user to enter the AI temperature.
- `chatInterface(readme)`: Provides a chat interface for user interactions.

## Utility Functions

- `processFiles(files, readme, temperature)`: Processes selected files.
- `addNewFile(filePath)`: Adds a new file to the project.
- `createMissingFiles(lintOutput)`: Creates missing files detected during linting.
- `optimizeAndRefactorFile(filePath)`: Optimizes and refactors a given file.

## Main Execution Flow

The `main()` function orchestrates the execution of CodeCraftAI:

1. Reads the README.md file.
2. Prompts for AI temperature.
3. Enters a loop to continuously prompt for actions until the user chooses to exit.
4. Executes the chosen action:
   - Process existing files
   - Add a new file
   - Update README.md
   - Optimize project structure
   - Detect security vulnerabilities
   - Run code quality checks
   - Generate documentation
   - Chat interface
   - Optimize and refactor file
   - Exit

## Usage

To use CodeCraftAI, run the script and follow the prompts. Ensure you have the necessary dependencies installed and the `CLAUDE_KEY` environment variable set with your Anthropic API key.

```bash
node index.js
```

The tool will guide you through various options to manage and improve your project's codebase.