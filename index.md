# CodeCraftAI Documentation

## Overview

CodeCraftAI is a Node.js-based automated coding tool that generates, updates, and manages project files based on a README.md file. It uses the Anthropic API to generate code, provides various project management features, and offers an interactive command-line interface for user interaction.

## Table of Contents

1. [Dependencies](#dependencies)
2. [Configuration](#configuration)
3. [Main Functions](#main-functions)
4. [Utility Functions](#utility-functions)
5. [File Processing Functions](#file-processing-functions)
6. [Project Management Functions](#project-management-functions)
7. [Main Execution](#main-execution)

## Dependencies

The script uses the following external libraries:

- fs/promises: File system operations
- path: File path manipulations
- @anthropic-ai/sdk: Anthropic API client
- chalk: Console text styling
- inquirer: Interactive command-line user interface
- dotenv: Environment variable management
- child_process: Executing system commands
- util: Utility functions
- ignore: Parsing .gitignore files

## Configuration

- The script uses environment variables loaded from a .env file.
- It requires an Anthropic API key stored in the CLAUDE_KEY environment variable.

## Main Functions

### async function main()

The main entry point of the application. It runs an interactive loop that allows users to perform various actions on the project.

Usage:
```javascript
main().catch((error) => {
    console.error(chalk.red("An error occurred:"), error);
});
```

## Utility Functions

### async function readFile(filePath)

Reads the contents of a file.

Parameters:
- filePath: string - The path to the file to be read

Returns: string | null - The file contents or null if an error occurs

### async function writeFile(filePath, content)

Writes content to a file.

Parameters:
- filePath: string - The path to the file to be written
- content: string - The content to write to the file

### async function createSubfolders(filePath)

Creates any necessary subfolders for a given file path.

Parameters:
- filePath: string - The path of the file for which to create subfolders

### async function execAsync(command)

Promisified version of child_process.exec.

Parameters:
- command: string - The command to execute

Returns: Promise<{ stdout: string, stderr: string }> - The result of the command execution

## File Processing Functions

### async function generateCode(readme, currentCode, fileName)

Generates code for a file based on the README.md content and existing code.

Parameters:
- readme: string - The content of the README.md file
- currentCode: string | null - The current content of the file (if it exists)
- fileName: string - The name of the file being processed

Returns: string - The generated code

### async function processFiles(files, readme)

Processes multiple files, generating or updating their content.

Parameters:
- files: string[] - An array of file paths to process
- readme: string - The content of the README.md file

### async function splitLargeFile(filePath, content)

Splits a large file into multiple smaller modules.

Parameters:
- filePath: string - The path of the file to split
- content: string - The content of the file

### async function generateDocumentation(filePath, content)

Generates documentation for a file.

Parameters:
- filePath: string - The path of the file to document
- content: string - The content of the file

## Project Management Functions

### async function manageDependencies()

Checks for outdated dependencies and updates them if necessary.

### async function gitCommit()

Commits changes to the Git repository.

### async function analyzeProjectStructure()

Analyzes and displays the current project structure.

### async function optimizeProjectStructure()

Generates suggestions for optimizing the project structure.

### async function generateApiDocumentation()

Generates API documentation for the entire project.

### async function detectSecurityVulnerabilities()

Runs a security audit on the project dependencies.

## Main Execution

The script is executed by running the `main()` function, which presents an interactive menu to the user and performs the selected actions. The main loop continues until the user chooses to exit the program.

Usage example:

```javascript
node codecraftai.js
```

This will start the interactive CodeCraftAI tool, allowing users to manage and optimize their project through various automated functions.