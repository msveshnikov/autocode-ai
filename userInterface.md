# UserInterface.js Documentation

## Overview

`UserInterface.js` is a core component of the CodeCraftAI project, responsible for handling user interactions and coordinating various actions within the application. It provides a command-line interface for users to interact with different features of the project, such as code generation, analysis, documentation, and more.

This module integrates with other components of the project, including:

- FileManager
- CodeAnalyzer
- CodeGenerator
- DocumentationGenerator

It also utilizes external libraries like `inquirer` for user prompts and `chalk` for colorful console output.

## Main Object: UserInterface

The `UserInterface` object contains methods for managing user interactions and executing various actions based on user input.

### Methods

#### promptForAction()

Prompts the user to choose an action from a list of available options.

**Returns:** Promise<Object> - An object containing the selected action.

**Usage Example:**
```javascript
const { action } = await UserInterface.promptForAction();
```

#### promptForFiles(files)

Prompts the user to select files from a given list for processing.

**Parameters:**
- `files` (Array): List of file names to choose from.

**Returns:** Promise<Object> - An object containing the selected files.

**Usage Example:**
```javascript
const filesToProcess = await FileManager.getFilesToProcess();
const { selectedFiles } = await UserInterface.promptForFiles(filesToProcess);
```

#### promptForNewFile()

Prompts the user to enter the name of a new file to create.

**Returns:** Promise<Object> - An object containing the new file name.

**Usage Example:**
```javascript
const { newFile } = await UserInterface.promptForNewFile();
```

#### promptForLanguage()

Prompts the user to select a programming language.

**Returns:** Promise<Object> - An object containing the selected language.

**Usage Example:**
```javascript
const { language } = await UserInterface.promptForLanguage();
```

#### chatInterface(readme, projectStructure)

Initiates an interactive chat interface for the user to provide suggestions and make changes to the project.

**Parameters:**
- `readme` (String): Content of the README.md file.
- `projectStructure` (Object): Current project structure.

**Returns:** Promise<Object> - An object containing whether to continue the chat and the updated README content.

**Usage Example:**
```javascript
const result = await UserInterface.chatInterface(readme, projectStructure);
```

#### extractCodeSnippet(markdown)

Extracts a code snippet from a markdown string.

**Parameters:**
- `markdown` (String): Markdown content containing a code snippet.

**Returns:** String | null - The extracted code snippet or null if not found.

#### runAIAgents(projectStructure)

Runs various AI agents to perform tasks on the project.

**Parameters:**
- `projectStructure` (Object): Current project structure.

**Usage Example:**
```javascript
await UserInterface.runAIAgents(projectStructure);
```

#### processFiles(files, readme, projectStructure)

Processes selected files by generating or updating their content.

**Parameters:**
- `files` (Array): List of files to process.
- `readme` (String): Content of the README.md file.
- `projectStructure` (Object): Current project structure.

**Usage Example:**
```javascript
await UserInterface.processFiles(selectedFiles, readme, projectStructure);
```

#### handleAction(action, readme, readmePath, projectStructure)

Handles the execution of the selected action by the user.

**Parameters:**
- `action` (String): The selected action to perform.
- `readme` (String): Content of the README.md file.
- `readmePath` (String): Path to the README.md file.
- `projectStructure` (Object): Current project structure.

**Returns:** Boolean - Whether to continue execution or exit the application.

**Usage Example:**
```javascript
const continueExecution = await UserInterface.handleAction(action, readme, readmePath, projectStructure);
```

## Usage in the Project

The `UserInterface` module plays a central role in the CodeCraftAI project by:

1. Providing a user-friendly interface for interacting with various features.
2. Coordinating actions between different components of the project.
3. Managing the flow of the application based on user choices.
4. Facilitating file selection, code generation, and project modifications.

It is likely used in the main execution flow of the application, possibly in the `index.js` file, to drive the overall functionality of the CodeCraftAI tool.

## Dependencies

- `inquirer`: For creating interactive command-line user interfaces.
- `chalk`: For styling console output with colors.
- `@anthropic-ai/sdk`: For interacting with the Anthropic AI API.
- `path`: For handling file paths.
- Other project modules: `FileManager`, `CodeAnalyzer`, `CodeGenerator`, `DocumentationGenerator`.

This module is essential for providing a seamless and interactive experience for users of the CodeCraftAI project, allowing them to leverage AI-powered code generation, analysis, and documentation features through a simple command-line interface.