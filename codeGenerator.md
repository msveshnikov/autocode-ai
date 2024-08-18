# CodeGenerator.js Documentation

## Overview

`codeGenerator.js` is a core component of the CodeCraftAI project, responsible for generating and updating code files based on project requirements and structure. It utilizes the Anthropic AI model to generate code and update README files intelligently.

This module exports a `CodeGenerator` object with two main methods: `generate` for code generation and `updateReadme` for README file updates.

## Dependencies

-   `@anthropic-ai/sdk`: Used to interact with the Anthropic AI model.
-   `./config.js`: Imports configuration settings for the Anthropic model.

## CodeGenerator Object

### Methods

#### 1. generate(readme, currentCode, fileName, projectStructure)

Generates or updates a code file based on the provided README content, current code, file name, and project structure.

**Parameters:**

-   `readme` (string): Content of the README.md file.
-   `currentCode` (string): Current content of the file to be generated/updated (if any).
-   `fileName` (string): Name of the file to be generated or updated.
-   `projectStructure` (object): JSON representation of the project file structure.

**Returns:**

-   Promise<string>: The generated or updated code content.

**Usage Example:**

```javascript
const newCode = await CodeGenerator.generate(readmeContent, existingCode, "example.js", projectStructure);
```

#### 2. updateReadme(readme, projectStructure)

Updates the README.md file with new design ideas and considerations based on the current content and project structure.

**Parameters:**

-   `readme` (string): Current content of the README.md file.
-   `projectStructure` (object): JSON representation of the project file structure.

**Returns:**

-   Promise<string>: The updated README.md content.

**Usage Example:**

```javascript
const updatedReadme = await CodeGenerator.updateReadme(currentReadmeContent, projectStructure);
```

## Internal Functionality

Both methods use the Anthropic AI model to generate content. They construct prompts that include the necessary context (README content, current code, file name, project structure) and send these to the AI model for processing.

The AI responses are then returned as the generated code or updated README content.

## Configuration

The module uses configuration settings imported from `./config.js`, including:

-   `CONFIG.anthropicModel`: Specifies the Anthropic model to use.
-   `CONFIG.maxTokens`: Sets the maximum number of tokens for the AI response.

## Environment Variables

The module requires the `CLAUDE_KEY` environment variable to be set with the Anthropic API key.

## Project Context

Within the CodeCraftAI project structure, `codeGenerator.js` works alongside other components like `codeAnalyzer.js`, `documentationGenerator.js`, and `fileManager.js` to provide a comprehensive code generation and project management solution.
