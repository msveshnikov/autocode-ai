# CodeCraftAI Documentation

## Overview

CodeCraftAI is an automatic coding tool that helps developers generate, update, and manage code based on project requirements. It uses the Anthropic AI API to assist with various tasks such as code generation, documentation creation, project structure analysis, and more.

## Table of Contents

1. [Dependencies](#dependencies)
2. [Global Constants](#global-constants)
3. [Main Function](#main-function)
4. [Core Functions](#core-functions)
5. [File Operations](#file-operations)
6. [Code Generation and Updates](#code-generation-and-updates)
7. [Project Analysis and Optimization](#project-analysis-and-optimization)
8. [Security and Code Quality](#security-and-code-quality)
9. [Documentation Generation](#documentation-generation)
10. [User Interface](#user-interface)

## Dependencies

The script uses the following external dependencies:

- `fs/promises`: File system operations with promises
- `path`: File path operations
- `@anthropic-ai/sdk`: Anthropic AI API client
- `chalk`: Terminal string styling
- `inquirer`: Command-line user interfaces
- `child_process`: Spawning child processes
- `util`: Utility functions
- `ignore`: Parsing gitignore files

## Global Constants

```javascript
const excludedFiles = ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"];
const excludedDirs = [".git", "node_modules"];
const excludedExtensions = [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"];
```

These constants define files, directories, and file extensions that should be excluded from processing.

## Main Function

```javascript
async function main()
```

The `main` function is the entry point of the script. It provides a menu-driven interface for users to interact with various features of CodeCraftAI.

## Core Functions

### `readFile(filePath)`

Reads the content of a file.

- Parameters:
  - `filePath` (string): Path to the file
- Returns: Promise<string | null>

### `writeFile(filePath, content)`

Writes content to a file.

- Parameters:
  - `filePath` (string): Path to the file
  - `content` (string): Content to write

### `createOrUpdateFile(filePath, content)`

Creates a new file or updates an existing one with the given content.

- Parameters:
  - `filePath` (string): Path to the file
  - `content` (string): Content to write

### `createSubfolders(filePath)`

Creates necessary subfolders for a given file path.

- Parameters:
  - `filePath` (string): Path to the file

### `getFilesToProcess()`

Retrieves a list of files to process, respecting `.gitignore` and exclusion rules.

- Returns: Promise<string[]>

## Code Generation and Updates

### `generateCode(readme, currentCode, fileName)`

Generates or updates code based on README content and existing code.

- Parameters:
  - `readme` (string): Content of the README file
  - `currentCode` (string | null): Current content of the file (if it exists)
  - `fileName` (string): Name of the file being processed
- Returns: Promise<string>

### `processFiles(files, readme)`

Processes multiple files, generating or updating their content.

- Parameters:
  - `files` (string[]): Array of file paths to process
  - `readme` (string): Content of the README file

### `updateReadme(readme)`

Updates the README file with new design ideas and considerations.

- Parameters:
  - `readme` (string): Current content of the README file
- Returns: Promise<string>

## Project Analysis and Optimization

### `analyzeProjectStructure()`

Analyzes the current project structure and outputs a JSON representation.

### `optimizeProjectStructure()`

Generates suggestions for optimizing the project structure.

### `generateOptimizationSuggestions(structure)`

Generates optimization suggestions based on the current project structure.

- Parameters:
  - `structure` (object): JSON representation of the project structure
- Returns: Promise<string>

## Security and Code Quality

### `runCodeQualityChecks(filePath)`

Runs ESLint on a specific file and attempts to fix any issues.

- Parameters:
  - `filePath` (string): Path to the file to check

### `fixLintErrors(filePath, lintOutput)`

Attempts to fix ESLint errors in a file using AI assistance.

- Parameters:
  - `filePath` (string): Path to the file
  - `lintOutput` (string): ESLint error output

### `manageDependencies()`

Checks for outdated dependencies and updates them if necessary.

### `detectSecurityVulnerabilities()`

Runs `npm audit` to detect security vulnerabilities in the project.

## Documentation Generation

### `generateDocumentation(filePath, content)`

Generates documentation for a specific file.

- Parameters:
  - `filePath` (string): Path to the file
  - `content` (string): Content of the file

## User Interface

### `addNewFile(filePath)`

Adds a new file to the project.

- Parameters:
  - `filePath` (string): Path of the new file to create

### `chatInterface()`

Provides a chat interface for users to interact with CodeCraftAI.

- Returns: Promise<boolean>

## Usage Example

To use CodeCraftAI, run the script and follow the interactive prompts:

```bash
node index.js
```

The script will present a menu of options, allowing you to process files, add new files, update the README, analyze the project structure, and more.

---

This documentation provides an overview of the CodeCraftAI script and its main functions. For more detailed information about each function, refer to the inline comments in the source code.