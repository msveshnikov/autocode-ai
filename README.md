# AutoCode

AutoCode is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. AutoCode was bootstrapped by itself from one simple prompt.

![AutoCode Logo](image.png)

## Features

-   NodeJS-based console application
-   Automatic code generation based on README.md instructions
-   Utilizes Claude 3.5 Sonnet API for intelligent code generation
-   Incremental project building
-   Creates and modifies source files in the current folder and subfolders
-   Self-updating README.md with new design ideas and considerations
-   Code quality checks and suggestions/auto fixes
-   Automatic dependency management and creation of missing files
-   Adherence to DRY, KISS, and SRP principles
-   Intelligent code analysis and refactoring suggestions
-   Automated documentation generation
-   User-friendly command-line interface
-   Support for multiple programming languages
-   AI-powered agents for specialized tasks
-   Pricing tiers with license management
-   Cross-platform compatibility (Windows, macOS, Linux)
-   Syntax checking and auto-fixing

## Installation

No installation is required. AutoCode can be run directly using npx.

## Usage

1. Create CLAUDE_KEY environment variable (get your key here https://console.anthropic.com/settings/keys)
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
-   Claude 3.5 Sonnet API (model: "claude-3-5-sonnet-20241022", max_tokens: 8192)
-   Use async/await, ES6 modules, and fetch (no axios please)

## Project Structure

-   `codeAnalyzer.js`: Analyzes existing code for quality and improvement opportunities
-   `codeGenerator.js`: Generates new code based on instructions and API responses
-   `config.js`: Manages configuration settings for the application, including language-specific configs
-   `documentationGenerator.js`: Automatically generates documentation for the project
-   `fileManager.js`: Handles file operations and project structure management
-   `index.js`: Main entry point of the application
-   `userInterface.js`: Manages user interactions and command-line interface
-   `landing.html`: Template for generating project landing pages
-   `licenseManager.js`: Handles license management and validation
-   `server/index.js`: Express.js backend main point
-   `server/license-server.js`: Route for license management

## Supported Languages

AutoCode currently supports the following programming languages:

-   JavaScript (including TypeScript)
-   Python
-   C#
-   Java
-   Ruby
-   Go
-   Rust
-   PHP
-   Swift
-   Kotlin
-   Dart

Each language has its own configuration for file extensions, recommended linter, formatter, and package manager.

# TODO

-   improve design, make everything white background