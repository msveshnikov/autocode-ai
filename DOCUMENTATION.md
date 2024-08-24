# AutoCode Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Module Interactions](#module-interactions)
4. [Installation](#installation)
5. [Usage Instructions](#usage-instructions)
6. [Features](#features)
7. [AI Agents](#ai-agents)
8. [License Management](#license-management)
9. [Server Component](#server-component)

## Project Overview

AutoCode is an innovative automatic coding tool designed to bootstrap any software project incrementally. It transforms README.md instructions into a fully functional software project using the Claude 3.5 Sonnet API. AutoCode was bootstrapped by itself from one simple prompt, showcasing its capabilities in self-improvement and code generation.

The project aims to streamline the software development process by automating various aspects of coding, including code generation, optimization, documentation, and quality assurance. It supports multiple programming languages and incorporates AI-powered agents for specialized tasks.

## Architecture

AutoCode follows a modular architecture, with the main components organized as follows:

1. **Core Modules**:
   - `index.js`: The main entry point of the application.
   - `codeAnalyzer.js`: Analyzes existing code for quality and improvement opportunities.
   - `codeGenerator.js`: Generates new code based on instructions and API responses.
   - `config.js`: Manages configuration settings for the application.
   - `documentationGenerator.js`: Automatically generates documentation for the project.
   - `fileManager.js`: Handles file operations and project structure management.
   - `licenseManager.js`: Manages license validation and usage tracking.
   - `userInterface.js`: Manages user interactions and the command-line interface.

2. **AI Agents**: Specialized modules for various tasks (e.g., SQL migrations, API routes, testing).

3. **Server Component**: A separate Express.js backend for license management and user authentication.

4. **Configuration**: Extensive configuration options in `config.js` for language-specific settings, AI model parameters, and pricing tiers.

## Module Interactions

1. `index.js` initializes the application and orchestrates the main workflow.
2. `userInterface.js` handles user input and delegates tasks to other modules.
3. `codeGenerator.js` and `codeAnalyzer.js` work together to generate, optimize, and analyze code.
4. `fileManager.js` is used by various modules for reading and writing files.
5. `documentationGenerator.js` creates documentation based on the generated code and project structure.
6. `licenseManager.js` checks and manages user licenses throughout the application's execution.
7. AI agents are invoked by `codeGenerator.js` for specialized tasks.

## Installation

AutoCode is designed to be run directly using `npx` without a separate installation step:

1. Ensure you have Node.js version 20.0.0 or higher installed.
2. Set up the `CLAUDE_KEY` environment variable with your Claude API key.
3. Run AutoCode in your project directory using:
   ```
   npx autocode-ai
   ```

## Usage Instructions

1. Navigate to your project folder in the terminal.
2. Run `npx autocode-ai`.
3. Follow the prompts in the interactive menu to perform various actions:
   - Brainstorm and update README.md
   - Generate code for selected files
   - Detect missing dependencies
   - Run code quality checks
   - Generate documentation
   - Optimize and refactor code
   - Use the chat interface for specific suggestions
   - Run AI agents for specialized tasks
   - Analyze code quality and security
   - Generate unit tests
   - Analyze performance
   - Adjust AI temperature settings

## Features

- NodeJS-based console application
- Automatic code generation based on README.md instructions
- Utilizes Claude 3.5 Sonnet API for intelligent code generation
- Incremental project building
- Creates and modifies source files in the current folder and subfolders
- Self-updating README.md with new design ideas and considerations
- Code quality checks and suggestions/auto fixes
- Detects missing files/references and asks for user confirmation to create them
- Adherence to DRY, KISS, and SRP principles
- Automatic dependency management
- Modular architecture for easy extensibility
- Intelligent code analysis and refactoring suggestions
- Automated documentation generation
- User-friendly command-line interface
- Support for multiple programming languages
- Language-specific linting and formatting
- Customizable configuration for different programming languages
- Multi-language project handling
- AI-powered agents for specialized tasks
- Landing page generator for project showcasing
- Pricing tiers with license management
- Cross-platform compatibility (Windows, macOS, Linux)
- Context management system
- Long-running AI agents
- Review and revise workflow
- Syntax checking and auto-fixing
- Version-controlled sandbox for AI-generated code
- Iterative development alongside AI

## AI Agents

AutoCode incorporates various AI agents to handle specialized tasks:

1. SQL Migrations Agent: Writes database migrations and type files
2. Services Agent: Creates services that interact with the database and process data
3. API Routes Agent: Handles input validation, auth checks, and service calls for HTTP requests
4. Tester Agent: Writes integration tests for endpoints
5. Project Manager Agent: Orchestrates the work of other agents, builds the app, runs tests, and performs basic UI checks
6. Landing Page Agent: Generates a visually appealing landing page for the project
7. Reddit Promotion Agent: Manages Reddit promotions using the /u/AutoCode community
8. Code Review Agent: Provides automated code quality feedback and suggestions
9. DevOps Agent: Configures CI/CD pipelines and manages deployment processes
10. Security Agent: Performs security audits and suggests vulnerability fixes
11. Performance Agent: Analyzes code for performance bottlenecks and optimizations
12. Internationalization Agent: Implements multi-language support in projects

## License Management

AutoCode offers flexible pricing tiers:

1. Free Tier: 
   - $0/month
   - 10 requests/day
   - Basic features
   - 3 devices
   - Community support

2. Premium:
   - $10/month
   - Unlimited requests
   - All features
   - 10 devices
   - Priority support

3. Enterprise:
   - Custom pricing
   - Unlimited requests
   - All features + custom integrations
   - Unlimited devices
   - Dedicated support team
   - On-premises deployment option

The `licenseManager.js` module handles license validation and usage tracking, interacting with the server component for authentication and request management.

## Server Component

The server component is an Express.js backend that manages user authentication, license validation, and payment processing. Key features include:

- User registration and login
- License tier management
- Payment processing integration
- API endpoints for license checking and request tracking
- MongoDB database for user and inquiry storage
- Dockerized deployment for easy scalability

The server component is designed to be deployed separately from the main AutoCode application, allowing for centralized license management and user authentication.

---

This documentation provides an overview of the AutoCode project, its architecture, and key features. For more detailed information on specific modules or functionalities, refer to the individual documentation files generated for each component.