# AutoCode

AutoCode is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. AutoCode was bootstrapped by itself from one simple prompt.

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
-   Multi-language project handling

## Installation

No installation is required. AutoCode can be run directly using npx.

## Usage

1. Create CLAUDE_KEY environment variable
2. Navigate to your project folder in the terminal.
3. Run the following command:

```
npx autocode-ai
```

4. Follow the prompts and watch as your project comes to life!

## How It Works

AutoCode reads your README.md file and your sources and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. AutoCode then saves the generated code back to your project directory. It can now generate code for different languages based on the project requirements and applies language-specific linting and formatting.

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

AutoCode currently supports the following programming languages:

-   JavaScript (including TypeScript)
-   Python
-   C#

Each language has its own configuration for file extensions, recommended linter, formatter, and package manager.

## AI Agents

AutoCode now incorporates a system of AI agents to streamline the development process:

-   SQL Migrations Agent: Writes database migrations and type files
-   Services Agent: Creates services that interact with the database and process data
-   API Routes Agent: Handles input validation, auth checks, and service calls for HTTP requests
-   Tester Agent: Writes integration tests for endpoints
-   Project Manager Agent: Orchestrates the work of other agents, builds the app, runs tests, and performs basic UI checks

These agents work together to create a seamless development experience, allowing for faster feature implementation and easier code review processes.

## Future Enhancements

-   Expand AI agent capabilities and inter-agent communication
-   Develop a visual workflow designer for AI agent interactions
-   Integrate with popular IDEs and code editors for seamless workflow
-   Develop a code review AI agent to provide automated code quality feedback
