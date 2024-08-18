# CodeCraftAI Documentation

## Overview

CodeCraftAI is a powerful Node.js-based tool that automates various aspects of software development. It uses the Anthropic AI API to generate, update, and optimize code based on project requirements specified in a README.md file. The tool offers features such as file processing, documentation generation, code quality checks, security vulnerability detection, and project structure optimization.

## Table of Contents

1. [Dependencies](#dependencies)
2. [Global Variables](#global-variables)
3. [Main Functions](#main-functions)
4. [Utility Functions](#utility-functions)
5. [File Processing Functions](#file-processing-functions)
6. [Code Quality and Optimization Functions](#code-quality-and-optimization-functions)
7. [Documentation and Structure Functions](#documentation-and-structure-functions)
8. [User Interface Functions](#user-interface-functions)
9. [Main Execution](#main-execution)

## Dependencies

- fs/promises: File system operations
- path: File path manipulations
- @anthropic-ai/sdk: Anthropic AI API
- chalk: Terminal string styling
- inquirer: Command-line user interface
- child_process: Executing shell commands
- util: Utility functions
- ignore: .gitignore parsing

## Global Variables

- `excludedFiles`: Array of filenames to exclude from processing
- `excludedDirs`: Array of directory names to exclude from processing
- `excludedExtensions`: Array of file extensions to exclude from processing
- `anthropic`: Instance of the Anthropic AI client
- `execAsync`: Promisified version of child_process.exec

## Main Functions

### `main()`

The main entry point of the application. It sets up the initial configuration and provides a menu-driven interface for users to interact with various features of CodeCraftAI.

## Utility Functions

### `readFile(filePath)`

Reads the content of a file.

- **Parameters**: `filePath` (string) - Path to the file
- **Returns**: Promise<string|null> - File content or null if an error occurs

### `writeFile(filePath, content)`

Writes content to a file.

- **Parameters**:
  - `filePath` (string) - Path to the file
  - `content` (string) - Content to write
- **Returns**: Promise<void>

### `createSubfolders(filePath)`

Creates necessary subfolders for a given file path.

- **Parameters**: `filePath` (string) - Path to the file
- **Returns**: Promise<void>

## File Processing Functions

### `generateCode(readme, currentCode, fileName, temperature)`

Generates or updates code based on README content and existing code.

- **Parameters**:
  - `readme` (string) - Content of README.md
  - `currentCode` (string) - Existing code content
  - `fileName` (string) - Name of the file being processed
  - `temperature` (number) - AI generation temperature
- **Returns**: Promise<string> - Generated code

### `createOrUpdateFile(filePath, content)`

Creates or updates a file with the given content.

- **Parameters**:
  - `filePath` (string) - Path to the file
  - `content` (string) - Content to write
- **Returns**: Promise<void>

### `processFiles(files, readme, temperature)`

Processes multiple files, generating or updating code for each.

- **Parameters**:
  - `files` (string[]) - Array of file paths to process
  - `readme` (string) - Content of README.md
  - `temperature` (number) - AI generation temperature
- **Returns**: Promise<void>

### `getFilesToProcess()`

Retrieves a list of files to process, respecting .gitignore and exclusion rules.

- **Returns**: Promise<string[]> - Array of file paths to process

### `addNewFile(filePath)`

Adds a new file to the project.

- **Parameters**: `filePath` (string) - Path of the new file to create
- **Returns**: Promise<void>

## Code Quality and Optimization Functions

### `runCodeQualityChecks(filePath)`

Runs ESLint on a file and attempts to fix lint errors.

- **Parameters**: `filePath` (string) - Path to the file to check
- **Returns**: Promise<string> - Lint output or error message

### `fixLintErrors(filePath, lintOutput)`

Attempts to fix lint errors in a file using AI.

- **Parameters**:
  - `filePath` (string) - Path to the file
  - `lintOutput` (string) - ESLint output
- **Returns**: Promise<void>

### `optimizeAndRefactorFile(filePath)`

Optimizes and refactors the code in a file using AI.

- **Parameters**: `filePath` (string) - Path to the file to optimize
- **Returns**: Promise<void>

### `detectSecurityVulnerabilities()`

Runs npm audit to detect security vulnerabilities in the project.

- **Returns**: Promise<void>

## Documentation and Structure Functions

### `generateDocumentation(filePath, content)`

Generates documentation for a given file.

- **Parameters**:
  - `filePath` (string) - Path to the file
  - `content` (string) - Content of the file
- **Returns**: Promise<void>

### `optimizeProjectStructure()`

Analyzes the project structure and provides optimization suggestions.

- **Returns**: Promise<void>

### `generateOptimizationSuggestions(structure)`

Generates optimization suggestions for the project structure using AI.

- **Parameters**: `structure` (object) - Project structure object
- **Returns**: Promise<string> - Optimization suggestions

## User Interface Functions

### `chatInterface(readme)`

Provides a chat interface for users to interact with CodeCraftAI.

- **Parameters**: `readme` (string) - Content of README.md
- **Returns**: Promise<{continue: boolean, updatedReadme: string}>

### `selectFilesForProcessing(files)`

Allows users to select files for processing from a list.

- **Parameters**: `files` (string[]) - Array of file paths
- **Returns**: Promise<string[]> - Selected file paths

## Main Execution

The script is executed by running the `main()` function, which provides a menu-driven interface for users to interact with various features of CodeCraftAI. The main loop continues until the user chooses to exit.

Usage example:

```bash
node index.js
```

This will start the CodeCraftAI tool and present the user with a menu of options to choose from.