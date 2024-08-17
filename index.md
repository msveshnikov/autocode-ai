# CodeCraftAI Documentation

## Overview

CodeCraftAI is an automatic coding tool that generates, updates, and manages code based on project requirements specified in a README.md file. It uses the Anthropic AI API to generate code, create unit tests, produce documentation, and optimize project structure. The tool also includes features for managing dependencies, running code quality checks, and handling version control with Git.

## Main Functions

### `main()`

The main entry point of the application. It runs a loop that processes files, manages dependencies, runs quality checks, generates tests and documentation, and provides options for further actions.

**Usage:**

```javascript
main().catch((error) => {
    console.error(chalk.red("An error occurred:"), error);
});
```

### `readFile(filePath)`

Reads the content of a file.

**Parameters:**

-   `filePath` (string): The path to the file to be read.

**Returns:**

-   (Promise<string|null>): The content of the file or null if an error occurs.

### `writeFile(filePath, content)`

Writes content to a file.

**Parameters:**

-   `filePath` (string): The path to the file to be written.
-   `content` (string): The content to write to the file.

### `generateCode(readme, currentCode, fileName)`

Generates or updates code based on the README and current file content.

**Parameters:**

-   `readme` (string): Content of the README.md file.
-   `currentCode` (string): Current content of the file being processed.
-   `fileName` (string): Name of the file being processed.

**Returns:**

-   (Promise<string>): Generated code content.

### `processFiles(files, readme)`

Processes multiple files, generating or updating their content.

**Parameters:**

-   `files` (string[]): Array of file paths to process.
-   `readme` (string): Content of the README.md file.

### `updateReadme(readme)`

Updates the README.md file with new design ideas and considerations.

**Parameters:**

-   `readme` (string): Current content of the README.md file.

**Returns:**

-   (Promise<string>): Updated README content.

### `runCodeQualityChecks(filePath)`

Runs ESLint on a specified file.

**Parameters:**

-   `filePath` (string): Path to the file to check.

### `manageDependencies()`

Checks for outdated dependencies and updates them if necessary.

### `gitCommit()`

Commits changes to Git.

### `getFilesToProcess()`

Retrieves a list of files to be processed, respecting .gitignore rules.

**Returns:**

-   (Promise<string[]>): Array of file paths to process.

### `splitLargeFile(filePath, content)`

Splits large files into smaller modules.

**Parameters:**

-   `filePath` (string): Path to the file to split.
-   `content` (string): Content of the file.

### `generateUnitTests(filePath, content)`

Generates unit tests for a given file.

**Parameters:**

-   `filePath` (string): Path to the file to generate tests for.
-   `content` (string): Content of the file.

### `generateDocumentation(filePath, content)`

Generates documentation for a given file.

**Parameters:**

-   `filePath` (string): Path to the file to document.
-   `content` (string): Content of the file.

### `analyzeProjectStructure()`

Analyzes and displays the current project structure.

### `optimizeProjectStructure()`

Provides suggestions for optimizing the project structure.

### `generateApiDocumentation()`

Generates API documentation for the entire project.

### `detectSecurityVulnerabilities()`

Runs npm audit to detect security vulnerabilities in dependencies.

## Usage Example

To use CodeCraftAI, ensure you have a README.md file in your project directory and run the script:

```bash
node codecraftai.js
```

The tool will guide you through various options for managing your project, including processing files, adding new files, updating the README, analyzing project structure, and more.

## Dependencies

-   fs/promises
-   path
-   @anthropic-ai/sdk
-   chalk
-   inquirer
-   dotenv
-   child_process
-   util
-   ignore

Ensure all dependencies are installed before running the script.

## Environment Variables

Set the following environment variable in a .env file:

-   CLAUDE_KEY: Your Anthropic API key

## Note

This tool makes significant changes to your project files. Always use version control and backup your project before running CodeCraftAI.
