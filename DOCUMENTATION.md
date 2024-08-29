# AutoCode Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Module Interactions](#module-interactions)
4. [Features](#features)
5. [Installation](#installation)
6. [Usage Instructions](#usage-instructions)
7. [Configuration](#configuration)
8. [AI Agents](#ai-agents)
9. [Pricing Tiers](#pricing-tiers)
10. [Security and Licensing](#security-and-licensing)
11. [Development and Contribution](#development-and-contribution)

## Project Overview

AutoCode is an innovative automatic coding tool designed to bootstrap any software project incrementally. It transforms README.md instructions into a fully functional software project using the Claude 3.5 Sonnet API. AutoCode was bootstrapped by itself from one simple prompt, demonstrating its capability to generate and evolve complex software projects.

The tool is designed to assist developers in rapidly prototyping and developing projects across multiple programming languages. It offers features such as automatic code generation, project structure optimization, dependency management, and intelligent code analysis.

## Architecture

AutoCode follows a modular architecture, consisting of several key components:

1. **Core Components**:

    - `index.js`: The main entry point of the application.
    - `codeGenerator.js`: Handles the generation of new code based on instructions and API responses.
    - `codeAnalyzer.js`: Analyzes existing code for quality and improvement opportunities.
    - `fileManager.js`: Manages file operations and project structure.
    - `userInterface.js`: Handles user interactions and command-line interface.

2. **Support Components**:

    - `config.js`: Manages configuration settings for the application.
    - `documentationGenerator.js`: Automatically generates documentation for the project.
    - `licenseManager.js`: Handles license management and validation.

3. **Server Components**:

    - `server/index.js`: Express.js backend main entry point.
    - `server/license-server.js`: Handles license management and user authentication.

4. **AI Integration**:
    - The project utilizes the Claude 3.5 Sonnet API for intelligent code generation and analysis.

## Module Interactions

1. `index.js` initializes the application and orchestrates the interaction between different modules.
2. `userInterface.js` prompts the user for actions and delegates tasks to appropriate modules.
3. `codeGenerator.js` and `codeAnalyzer.js` work together to generate, optimize, and analyze code.
4. `fileManager.js` handles all file system operations, including reading and writing files.
5. `documentationGenerator.js` creates documentation based on the generated code and project structure.
6. `licenseManager.js` interacts with the server components to validate licenses and manage user authentication.

## Features

-   NodeJS-based console application
-   Automatic code generation based on README.md instructions
-   Incremental project building
-   Code quality checks and suggestions/auto fixes
-   Automatic dependency management
-   Intelligent code analysis and refactoring suggestions
-   Automated documentation generation
-   User-friendly command-line interface
-   Support for multiple programming languages
-   Language-specific linting and formatting
-   AI-powered agents for specialized tasks
-   Pricing tiers with license management
-   Cross-platform compatibility (Windows, macOS, Linux)
-   Context management system
-   Long-running AI agents
-   Review and revise workflow
-   Syntax checking and auto-fixing
-   Iterative development alongside AI

## Installation

No installation is required. AutoCode can be run directly using npx:

1. Ensure you have Node.js (version 20.0.0 or higher) installed.
2. Set up the CLAUDE_KEY environment variable with your Claude API key.

## Usage Instructions

1. Navigate to your project folder in the terminal.
2. Run the following command:

```
npx autocode-ai
```

3. Follow the prompts to select actions and provide input.
4. AutoCode will generate or update files based on your instructions and the project's README.md.

## Configuration

The `config.js` file contains various configuration options, including:

-   Excluded files and directories
-   Language-specific configurations (linters, formatters, package managers)
-   AI model settings
-   Pricing tier information
-   Landing page configuration

Users can modify these settings to customize AutoCode's behavior for their specific project needs.

## AI Agents

AutoCode includes several AI agents for specialized tasks:

-   SQL Migrations Agent
-   Tester Agent
-   Project Manager Agent
-   Landing Page Agent
-   Reddit Promotion Agent
-   DevOps Agent
-   Performance Agent
-   Internationalization Agent

These agents can be invoked to perform specific tasks within the project, enhancing automation and efficiency.

## Pricing Tiers

AutoCode offers three pricing tiers:

1. **Free**: Basic features, 100 requests per day, 3 devices, community support.
2. **Premium**: All features, unlimited requests, 10 devices, priority support.
3. **Enterprise**: All features, custom integrations, unlimited devices, dedicated support team, on-premises option.

## Security and Licensing

-   The project uses a license server (`server/license-server.js`) to manage user authentication and license validation.
-   The `licenseManager.js` module handles license checks and user logins.
-   Secure token storage is implemented for maintaining user sessions.

## Development and Contribution

To contribute to AutoCode:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Make changes and add tests if applicable.
4. Run linting checks using `npm run lint`.
5. Submit a pull request with a detailed description of your changes.

For security reasons, the project uses JavaScript obfuscation. Run `npm run obfuscate` to obfuscate the code before distribution.

---

This documentation provides an overview of the AutoCode project, its architecture, features, and usage instructions. For more detailed information on specific modules or functions, refer to the inline documentation and comments within the source code.
