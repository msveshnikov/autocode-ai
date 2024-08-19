# CodeCraftAI Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Module Interactions](#module-interactions)
4. [Features](#features)
5. [Installation](#installation)
6. [Usage Instructions](#usage-instructions)
7. [Configuration](#configuration)
8. [Contributing](#contributing)
9. [License](#license)

## Project Overview

CodeCraftAI is an innovative automatic coding tool designed to bootstrap and incrementally develop software projects based on README.md instructions. It leverages the Claude 3.5 Sonnet API to interpret project requirements and generate functional code. The tool was bootstrapped by itself from a simple prompt, showcasing its capabilities in self-improvement and project development.

CodeCraftAI aims to streamline the software development process by automating code generation, project structure optimization, and documentation creation. It provides a user-friendly command-line interface that allows developers to interact with the AI, make project-wide changes, and incrementally build their software projects.

## Architecture

CodeCraftAI follows a modular architecture, with each module responsible for specific functionalities:

1. **index.js**: The main entry point of the application, orchestrating the overall flow and user interactions.
2. **codeAnalyzer.js**: Handles code quality checks, linting, and project structure optimization.
3. **codeGenerator.js**: Generates and updates code based on README.md instructions and project structure.
4. **config.js**: Manages configuration settings for the application.
5. **documentationGenerator.js**: Automatically generates documentation for individual files and the entire project.
6. **fileManager.js**: Handles file operations, project structure management, and gitignore parsing.
7. **userInterface.js**: Manages user interactions and the command-line interface.

## Module Interactions

1. **index.js** acts as the central coordinator, calling functions from other modules based on user input.
2. **fileManager.js** is used by most modules to read, write, and manage project files.
3. **codeGenerator.js** and **codeAnalyzer.js** work together to generate, optimize, and refactor code.
4. **documentationGenerator.js** uses information from other modules to create comprehensive documentation.
5. **userInterface.js** handles user input and displays information to the user.
6. **config.js** provides configuration settings used across all modules.

## Features

-   NodeJS-based console application
-   Automatic code generation based on README.md instructions
-   Utilizes Claude 3.5 Sonnet API for intelligent code generation
-   Incremental project building
-   Creates and modifies source files in the current folder and subfolders
-   Self-updating README.md with new design ideas and considerations
-   Code quality checks and suggestions/auto fixes
-   Detection of missing files/references with user confirmation for creation
-   Adherence to DRY, KISS, and SRP principles
-   Automatic dependency management
-   Modular architecture for easy extensibility
-   Intelligent code analysis and refactoring suggestions
-   Automated documentation generation
-   User-friendly command-line interface
-   Project structure optimization
-   File splitting for large files
-   Chat interface for direct interaction with the AI

## Installation

No installation is required. CodeCraftAI can be run directly using npx. However, you need to have Node.js (version 20.0.0 or higher) installed on your system.

## Usage Instructions

1. Set up the CLAUDE_KEY environment variable with your Claude 3.5 Sonnet API key.
2. Navigate to your project folder in the terminal.
3. Run the following command:

```
npx codecraft-ai
```

4. Follow the prompts in the interactive menu to perform various actions:
    - Process files: Generate or update code for selected files
    - Add a new file: Create a new file in the project
    - Update README.md: Add new design ideas and considerations
    - Optimize project structure: Analyze and suggest improvements to the project structure
    - Run code quality checks: Perform linting and auto-fix issues
    - Generate documentation: Create documentation for individual files or the entire project
    - Optimize and refactor file: Improve code quality and structure for selected files
    - Chat interface: Directly interact with the AI for custom requests

## Configuration

The `config.js` file contains various configuration settings:

-   `excludedFiles`: Files to be ignored during processing
-   `excludedDirs`: Directories to be ignored during processing
-   `excludedExtensions`: File extensions to be ignored during processing
-   `anthropicModel`: The Claude API model to be used
-   `maxTokens`: Maximum number of tokens for API requests
-   `maxFileLines`: Maximum number of lines allowed in a single file before splitting

## Contributing

Contributions to CodeCraftAI are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with descriptive commit messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

Please ensure that your code follows the existing style and passes all linting checks.

## License

CodeCraftAI is released under the MIT License. See the LICENSE file for more details.
