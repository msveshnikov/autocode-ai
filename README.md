# CodeCraftAI

CodeCraftAI is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. CodeCraftAI was bootstrapped by itself from one simple prompt.

## Features

-   NodeJS-based console application
-   Automatic code generation based on README.md instructions
-   Utilizes Claude 3.5 Sonnet API for intelligent code generation
-   Incremental project building
-   Creates and modifies source files in the current folder and subfolders
-   Self-updating README.md with new design ideas and considerations
-   Code quality checks and suggestions/auto fixes

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

CodeCraftAI reads your README.md file and your sources and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. CodeCraftAI then saves the generated code back to your project directory.

## Requirements

-   Node.js (version 20.0.0 or higher)
-   ES6 imports and async/await syntax
-   Detect missing files/references and ask user confirmation to create them (suggest folder and name by AI)
-   Adherence to DRY, KISS, and SRP principles
-   Automatic dependency management and creation of missing files


## New Requirement

Add project file structure (eligible files list with paths) to AI processing as well