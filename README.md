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
-   Detect missing files/references and ask user confirmation to create them
-   Adherence to DRY, KISS, and SRP principles
-   Automatic dependency management and creation of missing files
-   Modular architecture for easy extensibility
-   Intelligent code analysis and refactoring suggestions
-   Automated documentation generation
-   User-friendly command-line interface
-   Support for multiple programming languages
-   Language-specific linting and formatting
-   Customizable configuration for different programming languages
-   Multi-language project handling
-   AI-powered agents for specialized tasks
-   Landing page generator for project showcasing
-   Pricing tiers with license management
-   Cross-platform compatibility (Windows, macOS, Linux)
-   Context management system
-   Long-running AI agents
-   Review and revise workflow
-   Syntax checking and auto-fixing
-   Version-controlled sandbox for AI-generated code
-   Iterative development alongside AI

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
-   Claude 3.5 Sonnet API (model: "claude-3-5-sonnet-20240620", max_tokens: 8192)
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
-   `server/license-server.js`: Express.js server for license management

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

Each language has its own configuration for file extensions, recommended linter, formatter, and package manager.

## AI Agents

AutoCode incorporates a system of AI agents to streamline the development process:

-   SQL Migrations Agent: Writes database migrations and type files
-   Services Agent: Creates services that interact with the database and process data
-   API Routes Agent: Handles input validation, auth checks, and service calls for HTTP requests
-   Tester Agent: Writes integration tests for endpoints
-   Project Manager Agent: Orchestrates the work of other agents, builds the app, runs tests, and performs basic UI checks
-   Landing Page Agent: Generates a visually appealing landing page for the project
-   Reddit Promotion Agent: Manages Reddit promotions using the /u/AutoCode community
-   Code Review Agent: Provides automated code quality feedback and suggestions
-   DevOps Agent: Configures CI/CD pipelines and manages deployment processes
-   Security Agent: Performs security audits and suggests vulnerability fixes
-   Performance Agent: Analyzes code for performance bottlenecks and optimizations
-   Internationalization Agent: Implements multi-language support in projects

## Landing Page Generator

AutoCode includes a landing page generator to showcase your project:

-   Automatically creates a responsive, mobile-friendly landing page
-   Uses a sleek design with deep blue and cyan gradients on a black background
-   Incorporates console-style imagery for a "matrix" theme
-   Highlights key features and project information
-   Customizable content based on your README.md and project structure
-   Integrates with popular analytics tools for visitor tracking

## Pricing and License Management

AutoCode offers flexible pricing tiers to suit different needs:

### Free Tier

-   $0/month
-   10 requests/day
-   Basic features
-   3 devices
-   Community support

### Premium

-   $10/month
-   Unlimited requests
-   All features
-   10 devices
-   Priority support

### Enterprise

-   Custom pricing
-   Unlimited requests
-   All features + custom integrations
-   Unlimited devices
-   Dedicated support team
-   On-premises deployment option

License management is handled through an Express.js server with `/login` and `/check` license methods.

## Long-Running Agents

-   Use long-running agents to plan out and implement tasks that are too large for ChatGPT or IDE-based tools
-   Agents can work on complex, multi-step tasks while maintaining context

## Review and Revise

-   Proposed changes are accumulated in a version-controlled sandbox
-   Review and iterate before applying changes to your actual project
-   Easily revert or modify AI-generated code

## Automatic Syntax Checking

-   Auto-fix syntax in 30+ languages
-   Attempts to fix other common issues like missing imports, variable declarations, and function implementations

## Future Enhancements

-   Expand AI agent capabilities and inter-agent communication
-   Integrate with popular IDEs and code editors for seamless workflow
-   Develop a web-based interface for managing AutoCode projects
-   Implement a cross-platform desktop application for enhanced user experience
-   Add support for more programming languages and frameworks
-   Create a marketplace for custom AI agents and plugins
-   Develop a natural language processing feature for converting user stories to code
-   Create a collaborative mode for team-based AI-assisted development
-   Develop a code migration assistant for updating legacy codebases

## TODO

-   send package.json content (or other package file for c#, java, etc) to Missing Dependencies checker