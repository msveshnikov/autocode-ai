# CodeCraftAI Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Module Interactions](#module-interactions)
4. [Features](#features)
5. [Installation](#installation)
6. [Usage Instructions](#usage-instructions)
7. [AI Agents](#ai-agents)
8. [Future Enhancements](#future-enhancements)

## Project Overview

CodeCraftAI is an innovative automatic coding tool designed to bootstrap and incrementally develop software projects using the Claude 3.5 Sonnet API. It transforms README.md instructions into a fully functional software project, supporting multiple programming languages and providing a suite of development tools and AI-powered assistants.

The project aims to streamline the software development process by automating various tasks such as code generation, documentation, testing, and optimization. CodeCraftAI is designed to be flexible, extensible, and capable of handling complex project structures across different programming languages.

## Architecture

CodeCraftAI is built as a Node.js-based console application with a modular architecture. The main components of the system are:

1. **Entry Point (index.js)**: The main script that initializes the application and manages the overall flow.

2. **User Interface (userInterface.js)**: Handles user interactions and provides a command-line interface for various actions.

3. **File Manager (fileManager.js)**: Manages file operations, project structure, and file system interactions.

4. **Code Generator (codeGenerator.js)**: Generates and updates code based on README.md instructions and AI responses.

5. **Code Analyzer (codeAnalyzer.js)**: Performs code quality checks, linting, and suggests optimizations.

6. **Documentation Generator (documentationGenerator.js)**: Automatically generates documentation for the project and individual files.

7. **Configuration (config.js)**: Stores project-wide settings and language-specific configurations.

8. **AI Integration**: Utilizes the Claude 3.5 Sonnet API for intelligent code generation and analysis.

## Module Interactions

1. The `index.js` file initializes the application and starts the main loop, which prompts the user for actions using the `UserInterface` module.

2. Based on user input, different modules are invoked:

    - `CodeGenerator` creates or updates code files.
    - `CodeAnalyzer` performs code quality checks and suggests improvements.
    - `DocumentationGenerator` creates documentation for files and the overall project.
    - `FileManager` handles all file system operations, including reading, writing, and managing the project structure.

3. The `UserInterface` module orchestrates the interactions between different components and manages the flow of the application.

4. The `CONFIG` object in `config.js` is used throughout the application to maintain consistent settings and language-specific configurations.

5. AI integration is primarily handled by the `CodeGenerator` and `CodeAnalyzer` modules, which use the Claude 3.5 Sonnet API to generate code, analyze existing code, and provide intelligent suggestions.

## Features

-   NodeJS-based console application
-   Automatic code generation based on README.md instructions
-   Multi-language support (JavaScript, Python, C#)
-   Incremental project building
-   Code quality checks and auto-fixing capabilities
-   Automated documentation generation
-   Intelligent code analysis and refactoring suggestions
-   Project structure optimization
-   Dependency management
-   Security vulnerability analysis
-   AI-powered chat interface for project modifications
-   Modular architecture for easy extensibility
-   AI agents for specialized tasks (e.g., SQL migrations, API routes, testing)

## Installation

No installation is required. CodeCraftAI can be run directly using npx. However, you need to have Node.js (version 20.0.0 or higher) installed on your system.

## Usage Instructions

1. Set up the CLAUDE_KEY environment variable with your Claude 3.5 Sonnet API key.

2. Navigate to your project folder in the terminal.

3. Run the following command:

    ```
    npx codecraft-ai
    ```

4. Follow the prompts in the command-line interface to perform various actions:

    - Brainstorm and update README.md
    - Generate code for selected files
    - Detect missing dependencies
    - Run static code quality checks
    - Generate documentation
    - Optimize and refactor files
    - Use the chat interface for project modifications
    - Generate project-wide documentation
    - Analyze code quality
    - Optimize project structure
    - Add new files
    - Run AI agents for specialized tasks
    - Perform security analysis

5. CodeCraftAI will guide you through each process, providing feedback and requesting confirmations when necessary.

## AI Agents

CodeCraftAI incorporates a system of AI agents to streamline specific development tasks:

1. **SQL Migrations Agent**: Writes database migrations and type files.
2. **Services Agent**: Creates services that interact with the database and process data.
3. **API Routes Agent**: Handles input validation, auth checks, and service calls for HTTP requests.
4. **Tester Agent**: Writes integration tests for endpoints.
5. **Project Manager Agent**: Orchestrates the work of other agents, builds the app, runs tests, and performs basic UI checks.

These agents can be invoked through the main user interface to automate complex tasks and ensure consistency across different parts of the project.

## Future Enhancements

CodeCraftAI has a roadmap for future improvements, including:

-   Implementing language-specific modules for better code organization
-   Adding support for more programming languages
-   Enhancing multi-language project handling
-   Integrating with popular version control systems
-   Developing a plugin system for extending functionality
-   Creating a web-based interface for easier project management
-   Implementing real-time collaboration features for team projects
-   Expanding AI agent capabilities and inter-agent communication
-   Developing a visual workflow designer for AI agent interactions
-   Implementing natural language processing for more intuitive feature requests
-   Creating a machine learning model to improve code generation based on user feedback
-   Integrating with popular IDEs and code editors for seamless workflow
-   Developing a code review AI agent to provide automated code quality feedback
-   Implementing a performance optimization agent to suggest and apply performance improvements
-   Creating a security analysis agent to identify and address potential vulnerabilities
-   Developing a documentation agent to generate and maintain comprehensive project documentation
-   Implementing a deployment agent to automate the process of deploying applications to various environments

These enhancements aim to make CodeCraftAI an even more powerful and versatile tool for software development, catering to a wide range of project types and development workflows.
