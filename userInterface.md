# UserInterface.js Documentation

## Overview

`UserInterface.js` is a core module in the AutoCode project that handles user interactions and orchestrates various operations within the application. It provides a command-line interface for users to interact with different features of AutoCode, including code generation, analysis, documentation, and AI agent execution.

The module imports various dependencies and other project modules to facilitate its operations. It uses the `inquirer` library for interactive prompts, `chalk` for colored console output, and `ora` for loading spinners.

## Key Components

### `anthropic` Instance

An instance of the Anthropic API client is created using the API key stored in the environment variables.

### `UserInterface` Object

This is the main export of the module, containing all the methods for user interaction and action handling.

## Methods

### `promptForAction()`

Prompts the user to select an action from a list of available options.

**Returns:** Promise<Object> - An object containing the selected action.

### `promptForModel()`

Prompts the user to select a Claude model.

**Returns:** Promise<Object> - An object containing the selected model.

### `setModel()`

Sets the selected model in the user's settings file.

### `getModel()`

Retrieves the currently set model from the user's settings file.

**Returns:** Promise<string> - The name of the current model.

### `promptForFiles(files)`

Prompts the user to select files for processing.

**Parameters:**
- `files`: Array<string> - List of available files.

**Returns:** Promise<Object> - An object containing the selected files.

### `promptForNewFile()`

Prompts the user to enter the name of a new file to create.

**Returns:** Promise<Object> - An object containing the new file name.

### `promptForLanguage()`

Prompts the user to select a programming language.

**Returns:** Promise<Object> - An object containing the selected language.

### `promptForTemperature()`

Prompts the user to select a temperature for AI generation.

**Returns:** Promise<Object> - An object containing the selected temperature.

### `promptForLogin()`

Prompts the user for login credentials.

**Returns:** Promise<Object> - An object containing the email and password.

### `chatInterface(projectStructure, readme)`

Implements an interactive chat interface for processing user suggestions.

**Parameters:**
- `projectStructure`: Object - The current project structure.
- `readme`: string - The content of the README file.

**Returns:** Promise<Object> - An object indicating whether to continue and the updated README.

### `generateAIAgents(projectStructure, readme)`

Generates code for AI agents based on the project structure and README.

**Parameters:**
- `projectStructure`: Object - The current project structure.
- `readme`: string - The content of the README file.

### `runAIAgents(projectStructure, readme)`

Runs selected AI agents on the project.

**Parameters:**
- `projectStructure`: Object - The current project structure.
- `readme`: string - The content of the README file.

### `processFiles(files, readme, projectStructure)`

Processes selected files by generating or updating their content.

**Parameters:**
- `files`: Array<string> - List of files to process.
- `readme`: string - The content of the README file.
- `projectStructure`: Object - The current project structure.

### `handleAction(action, readme, readmePath, projectStructure)`

Handles the execution of the selected action.

**Parameters:**
- `action`: string - The selected action.
- `readme`: string - The content of the README file.
- `readmePath`: string - The path to the README file.
- `projectStructure`: Object - The current project structure.

**Returns:** Promise<boolean> - Indicates whether to continue execution.

### `getTemperature()`

Retrieves the current temperature setting from the user's settings file.

**Returns:** Promise<number> - The current temperature setting.

### `setTemperature()`

Sets a new temperature in the user's settings file.

### `handleLogin()`

Handles the user login process.

**Returns:** Promise<boolean> - Indicates whether the login was successful.

## Usage Example

```javascript
import UserInterface from './userInterface.js';
import FileManager from './fileManager.js';

async function main() {
    const readme = await FileManager.read('README.md');
    const projectStructure = await FileManager.getProjectStructure();
    
    let continueExecution = true;
    while (continueExecution) {
        const { action } = await UserInterface.promptForAction();
        continueExecution = await UserInterface.handleAction(action, readme, 'README.md', projectStructure);
    }
}

main().catch(console.error);
```

This example demonstrates how to use the `UserInterface` module to create an interactive command-line interface for the AutoCode project. It continuously prompts the user for actions and handles them until the user chooses to exit.

## Notes

- The `UserInterface` module plays a central role in the AutoCode project, connecting various components and providing a user-friendly interface for interacting with the system.
- It integrates with other modules like `FileManager`, `CodeGenerator`, `CodeAnalyzer`, and various AI agents to provide a comprehensive set of features.
- The module handles file operations, code generation, documentation, and project management tasks through its various methods.
- It also manages user settings, including model selection and temperature settings for AI operations.

This documentation provides an overview of the `UserInterface.js` file and its role in the AutoCode project. For more detailed information about specific functions or components, refer to the inline comments and function descriptions within the code.