# CodeCraftAI

CodeCraftAI is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. CodeCraftAI was bootstrapped by itself from one simple prompt.

![alt text](image.png)

## Features

-   NodeJS-based console application
-   Automatic code generation based on README.md instructions
-   Utilizes Claude 3.5 Sonnet API for intelligent code generation
-   Incremental project building
-   Creates and modifies source files in the current folder and subfolders
-   Self-updating README.md with new design ideas and considerations
-   Code quality checks and suggestions/auto fixes
-   Detect missing files/references and ask user confirmation to create them
-   Adherence to DRY, KISS, and SRP principles
-   Automatic dependency management and creation of missing files
-   Modular architecture for easy extensibility
-   Intelligent code analysis and refactoring suggestions
-   Automated documentation generation
-   User-friendly command-line interface
-   Support for multiple programming languages (JavaScript, Python, C#)
-   Language-specific linting and formatting
-   Customizable configuration for different programming languages

## Installation

No installation is required. CodeCraftAI can be run directly using npx.

## Usage

1. Create CLAUDE_KEY environment variable
2. Navigate to your project folder in the terminal.
3. Run the following command:

```
npx codecraft-ai
```

4. Follow the prompts and watch as your project comes to life!

## How It Works

CodeCraftAI reads your README.md file and your sources and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. CodeCraftAI then saves the generated code back to your project directory. It can now generate code for different languages based on the project requirements and applies language-specific linting and formatting.

## Requirements

-   Node.js (version 20.0.0 or higher)
-   Claude 3.5 Sonnet API (model: "claude-3-5-sonnet-20240620", max_tokens: 8192)

## Project Structure

-   `codeAnalyzer.js`: Analyzes existing code for quality and improvement opportunities
-   `codeGenerator.js`: Generates new code based on instructions and API responses
-   `config.js`: Manages configuration settings for the application, including language-specific configs
-   `documentationGenerator.js`: Automatically generates documentation for the project
-   `fileManager.js`: Handles file operations and project structure management
-   `index.js`: Main entry point of the application
-   `userInterface.js`: Manages user interactions and command-line interface

## Supported Languages

CodeCraftAI currently supports the following programming languages:

-   JavaScript (including TypeScript)
-   Python
-   C#

Each language has its own configuration for file extensions, recommended linter, formatter, and package manager.

## Future Enhancements

-   Implement language-specific modules for better code organization
-   Add support for more programming languages
-   Enhance multi-language project handling
-   Implement AI-driven code optimization suggestions
-   Integrate with popular version control systems
-   Develop a plugin system for extending functionality
-   Create a web-based interface for easier project management
-   Implement real-time collaboration features for team projects
