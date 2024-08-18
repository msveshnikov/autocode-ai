# CodeCraftAI Documentation

## Overview

CodeCraftAI is an automatic coding tool that assists in generating, updating, and managing code based on project requirements specified in a README.md file. It uses the Anthropic API to generate code, provides various project management features, and offers an interactive interface for users to work with their codebase.

## Table of Contents

1. [Dependencies](#dependencies)
2. [Global Constants](#global-constants)
3. [Main Functions](#main-functions)
4. [Utility Functions](#utility-functions)
5. [File Processing Functions](#file-processing-functions)
6. [Project Management Functions](#project-management-functions)
7. [Security and Code Quality Functions](#security-and-code-quality-functions)
8. [User Interface Functions](#user-interface-functions)
9. [Main Execution](#main-execution)

## Dependencies

- fs/promises
- path
- @anthropic-ai/sdk
- chalk
- inquirer
- child_process
- util
- ignore

## Global Constants

```javascript
const excludedFiles = ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"];
const excludedDirs = [".git", "node_modules"];
const excludedExtensions = [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"];
```

These constants define files, directories, and file extensions that should be excluded from processing.

## Main Functions

### `async function main()`

The main entry point of the application. It provides an interactive menu for users to choose various actions such as processing files, adding new files, updating README, optimizing project structure, etc.

## Utility Functions

### `async function readFile(filePath)`

Reads the content of a file.

- **Parameters**: `filePath` (string) - Path to the file
- **Returns**: Promise<string|null> - File content or null if an error occurs

### `async function writeFile(filePath, content)`

Writes content to a file.

- **Parameters**:
  - `filePath` (string) - Path to the file
  - `content` (string) - Content to write
- **Returns**: Promise<void>

### `async function createSubfolders(filePath)`

Creates subfolders for a given file path if they don't exist.

- **Parameters**: `filePath` (string) - Path to the file
- **Returns**: Promise<void>

## File Processing Functions

### `async function generateCode(readme, currentCode, fileName)`

Generates or updates code based on README content and current file content.

- **Parameters**:
  - `readme` (string) - Content of README.md
  - `currentCode` (string|null) - Current content of the file (if exists)
  - `fileName` (string) - Name of the file to generate/update
- **Returns**: Promise<string> - Generated code

### `async function processFiles(files, readme)`

Processes multiple files by generating or updating their content.

- **Parameters**:
  - `files` (string[]) - Array of file paths to process
  - `readme` (string) - Content of README.md
- **Returns**: Promise<void>

### `async function getFilesToProcess()`

Gets a list of files to process, excluding those specified in global constants and .gitignore.

- **Returns**: Promise<string[]> - Array of file paths to process

## Project Management Functions

### `async function updateReadme(readme)`

Updates the README.md file with new design ideas and considerations.

- **Parameters**: `readme` (string) - Current content of README.md
- **Returns**: Promise<string> - Updated README content

### `async function optimizeProjectStructure()`

Analyzes the current project structure and provides optimization suggestions.

- **Returns**: Promise<void>

### `async function generateOptimizationSuggestions(structure)`

Generates optimization suggestions for the project structure.

- **Parameters**: `structure` (object) - Current project structure
- **Returns**: Promise<string> - Optimization suggestions

## Security and Code Quality Functions

### `async function detectSecurityVulnerabilities()`

Runs npm audit to detect security vulnerabilities in the project.

- **Returns**: Promise<void>

### `async function runCodeQualityChecks(filePath)`

Runs ESLint on a specific file and attempts to fix any issues.

- **Parameters**: `filePath` (string) - Path to the file to check
- **Returns**: Promise<void>

### `async function fixLintErrors(filePath, lintOutput)`

Attempts to fix lint errors in a file using AI-generated corrections.

- **Parameters**:
  - `filePath` (string) - Path to the file
  - `lintOutput` (string) - ESLint output containing errors
- **Returns**: Promise<void>

## User Interface Functions

### `async function chatInterface(readme)`

Provides an interactive chat interface for users to make requests and potentially update the README.

- **Parameters**: `readme` (string) - Current content of README.md
- **Returns**: Promise<{continue: boolean, updatedReadme: string}> - Object indicating whether to continue and the updated README content

### `async function addNewFile(filePath)`

Adds a new file to the project.

- **Parameters**: `filePath` (string) - Path of the new file to create
- **Returns**: Promise<void>

### `async function createMissingFiles(lintOutput)`

Creates missing files detected during lint checks.

- **Parameters**: `lintOutput` (string) - ESLint output containing missing file information
- **Returns**: Promise<void>

## Main Execution

The script is executed by running the `main()` function, which provides an interactive interface for users to perform various actions on their project.

```javascript
main().catch((error) => {
    console.error(chalk.red("An error occurred:"), error);
});
```

This catches any uncaught errors and logs them to the console.