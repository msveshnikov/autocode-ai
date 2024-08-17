# CodeCraftAI Documentation

## Overview

CodeCraftAI is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. It is a NodeJS-based console application that offers a wide range of features for automatic code generation, project management, and optimization.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [How It Works](#how-it-works)
5. [Requirements](#requirements)
6. [Core Components](#core-components)
7. [Advanced Features](#advanced-features)
8. [Future Enhancements](#future-enhancements)

## Features

- Automatic code generation based on README.md instructions
- Utilizes Claude 3.5 Sonnet API for intelligent code generation
- Incremental project building
- Easy installation and execution using npx
- Creates and modifies source files in the current folder and subfolders
- Self-updating README.md with new design ideas and considerations
- Intelligent project structure analysis and optimization
- Automatic dependency management and version control integration
- Code quality checks and suggestions
- Support for multiple programming languages and frameworks
- Visual representation of project structure and dependencies
- Automatic code optimization and refactoring suggestions
- Modular file splitting for efficient AI processing
- Comprehensive file coverage with configurable exceptions
- Integration with version control systems for automatic commits and branching

## Installation

No installation is required. CodeCraftAI can be run directly using npx.

## Usage

1. Create a .env file in the project root and add your Claude API key:

```
CLAUDE_KEY=your_api_key_here
```

2. Navigate to your project folder in the terminal.

3. Run the following command:

```
npx codecraft-ai
```

4. Follow the prompts and watch as your project comes to life!

## How It Works

CodeCraftAI reads your README.md file and your sources and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. CodeCraftAI then saves the generated code back to your project directory. If you develop CodeCraftAI itself, use git commit often and restart process to bring your new code to life.

## Requirements

- Node.js (version 20.0.0 or higher)
- ES6 imports and async/await syntax
- Claude 3.5 Sonnet API (model: "claude-3-5-sonnet-20240620", max_tokens: 8192)
- Chalk for UI enhancements
- Exclude non-source files (csv, png, binary, etc)
- User interaction for important development steps
- Automatic package installation via npm
- Adherence to DRY, KISS, and SRP principles

## Core Components

### Main Functions

- `main()`: The entry point of the application, running an interactive loop for user actions.
- `generateCode(readme, currentCode, fileName)`: Generates code based on README.md and existing code.
- `processFiles(files, readme)`: Processes multiple files, generating or updating content.
- `splitLargeFile(filePath, content)`: Splits large files into smaller modules.
- `generateDocumentation(filePath, content)`: Generates documentation for a file.

### Utility Functions

- `readFile(filePath)`: Reads file contents.
- `writeFile(filePath, content)`: Writes content to a file.
- `createSubfolders(filePath)`: Creates necessary subfolders for a given file path.
- `execAsync(command)`: Promisified version of child_process.exec.

### Project Management Functions

- `manageDependencies()`: Checks and updates outdated dependencies.
- `gitCommit()`: Commits changes to the Git repository.
- `analyzeProjectStructure()`: Analyzes and displays the current project structure.
- `optimizeProjectStructure()`: Generates suggestions for optimizing project structure.
- `generateApiDocumentation()`: Generates API documentation for the entire project.
- `detectSecurityVulnerabilities()`: Runs a security audit on project dependencies.

## Advanced Features

- Intelligent project structure analysis and optimization
- Automatic dependency management and version control integration
- Code quality checks and suggestions
- Support for multiple programming languages and frameworks
- Visual representation of project structure and dependencies
- Automatic code optimization and refactoring suggestions
- Modular file splitting for efficient AI processing
- Comprehensive file coverage with configurable exceptions
- Integration with version control systems for automatic commits and branching

## Future Enhancements

- Support for multi-language projects and polyglot programming
- Support for containerization and deployment automation
- AI-powered code review and security vulnerability detection
- Add support for code performance analysis and optimization
- Implement a chat-like interface for interactive project development
- Implement a caching system to improve performance
- Add support for React.JS development

This documentation provides an overview of CodeCraftAI, its features, usage instructions, and core components. As the project evolves, this documentation will be updated to reflect new features and improvements.