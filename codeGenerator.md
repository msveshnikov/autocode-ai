# CodeGenerator.js Documentation

## Overview

`CodeGenerator.js` is a core module in the project that handles various code generation tasks using the Anthropic AI model. It provides functionality for generating and updating code files, optimizing and refactoring existing code, splitting large files, generating dependency files, creating AI agent code, and more.

## Main Functions

### generate(readme, currentCode, fileName, projectStructure, allFileContents)

Generates or updates a code file based on the provided information.

**Parameters:**

-   `readme` (string): Content of the README.md file
-   `currentCode` (string): Current content of the file (if it exists)
-   `fileName` (string): Name of the file to generate or update
-   `projectStructure` (object): Structure of the project
-   `allFileContents` (object): Contents of all other files in the project

**Returns:** Promise<string> - The generated code

### updateReadme(readme, projectStructure)

Updates the README.md file with new design ideas and considerations.

**Parameters:**

-   `readme` (string): Current content of the README.md file
-   `projectStructure` (object): Structure of the project

**Returns:** Promise<string> - The updated README content

### splitLargeFile(filePath, content, projectStructure)

Splits a large file into smaller, more manageable parts.

**Parameters:**

-   `filePath` (string): Path of the file to split
-   `content` (string): Content of the file
-   `projectStructure` (object): Structure of the project

### optimizeAndRefactorFile(filePath, projectStructure)

Optimizes and refactors a given file.

**Parameters:**

-   `filePath` (string): Path of the file to optimize and refactor
-   `projectStructure` (object): Structure of the project

### generateDependencyFile(language, projectStructure, readme)

Generates a dependency file (e.g., package.json, requirements.txt) for the specified language.

**Parameters:**

-   `language` (string): Programming language of the project
-   `projectStructure` (object): Structure of the project
-   `readme` (string): Content of the README.md file

### generateAIAgentCode(agentType, agentDescription, projectStructure, readme)

Generates code for an AI agent based on the provided information.

**Parameters:**

-   `agentType` (string): Type of the AI agent
-   `agentDescription` (string): Description of the AI agent
-   `projectStructure` (object): Structure of the project
-   `readme` (string): Content of the README.md file

### generateLandingPage(projectStructure, readme)

Generates an HTML landing page for the project.

**Parameters:**

-   `projectStructure` (object): Structure of the project
-   `readme` (string): Content of the README.md file

### generateFullProject(projectStructure, readme)

Generates a full project structure based on the provided information.

**Parameters:**

-   `projectStructure` (object): Structure of the project
-   `readme` (string): Content of the README.md file

### updateChangelog(changes)

Updates the CHANGELOG.md file with new changes.

**Parameters:**

-   `changes` (array): Array of change descriptions

### createAppDescriptionFiles(projectStructure, readme)

Creates app description and metadata files for app store submissions.

**Parameters:**

-   `projectStructure` (object): Structure of the project
-   `readme` (string): Content of the README.md file

## Helper Functions

-   `cleanGeneratedCode(code)`: Cleans the generated code by removing markdown formatting.
-   `getLanguageFromExtension(fileExtension)`: Determines the programming language based on the file extension.
-   `calculateTokenStats(inputTokens, outputTokens)`: Calculates and displays token usage statistics.
-   `parseGeneratedFiles(content)`: Parses generated file content into separate files.

## Usage Example

```javascript
import CodeGenerator from "./codeGenerator.js";

// Generate a new file
const readme = "# My Project\n\nThis is a sample project.";
const fileName = "app.js";
const projectStructure = { "app.js": null, "README.md": null };
const generatedCode = await CodeGenerator.generate(readme, "", fileName, projectStructure, {});

// Optimize and refactor an existing file
await CodeGenerator.optimizeAndRefactorFile("app.js", projectStructure);

// Generate a full project
await CodeGenerator.generateFullProject(projectStructure, readme);
```

This module is central to the project's code generation and management capabilities, interacting with various other modules like `FileManager`, `CodeAnalyzer`, `DocumentationGenerator`, and `UserInterface` to provide a comprehensive code generation solution.
