# UserInterface.js Documentation

## Overview

`userInterface.js` is a core component of the CodeCraftAI project, responsible for handling user interactions and providing a command-line interface for various project-related tasks. It utilizes the `inquirer` library for prompting users, `chalk` for console styling, and the Anthropic API for AI-assisted interactions.

This module exports an object `UserInterface` with methods for different user interaction scenarios, including file processing, project management, and AI-assisted chat functionality.

## Dependencies

-   `inquirer`: For creating interactive command-line user interfaces
-   `chalk`: For styling console output
-   `@anthropic-ai/sdk`: For integrating with Anthropic's AI models
-   `./config.js`: For accessing project configuration
-   `./fileManager.js`: For file operations
-   `path`: For handling file paths

## Methods

### promptForAction()

Prompts the user to choose an action from a list of available options.

**Returns**: Promise<Object> - An object containing the user's selected action.

**Usage Example**:

```javascript
const { action } = await UserInterface.promptForAction();
```

### promptForFiles(files)

Allows the user to select multiple files from a given list for processing.

**Parameters**:

-   `files` (Array): A list of file names to choose from.

**Returns**: Promise<Object> - An object containing the array of selected files.

**Usage Example**:

```javascript
const { selectedFiles } = await UserInterface.promptForFiles(["file1.js", "file2.js"]);
```

### promptForNewFile()

Prompts the user to enter the name of a new file to create.

**Returns**: Promise<Object> - An object containing the name of the new file.

**Usage Example**:

```javascript
const { newFile } = await UserInterface.promptForNewFile();
```

### chatInterface(readme, projectStructure)

Provides an AI-assisted chat interface for user queries and project-related tasks.

**Parameters**:

-   `readme` (String): The current content of the README.md file.
-   `projectStructure` (Object): The current structure of the project.

**Returns**: Promise<Object> - An object containing:

-   `continue` (Boolean): Whether to continue the chat session.
-   `updatedReadme` (String): The potentially updated README content.

**Usage Example**:

```javascript
const { continue, updatedReadme } = await UserInterface.chatInterface(currentReadme, projectStructure);
```

## Key Features

1. **Action Selection**: Offers a menu of project-related actions for the user to choose from.
2. **File Management**: Allows selection of existing files and creation of new files.
3. **AI-Assisted Chat**: Integrates with Anthropic's AI model to provide intelligent responses to user queries.
4. **README Management**: Offers the option to update the project's README.md file based on chat interactions.

## Integration with Project

This module plays a central role in the CodeCraftAI project by:

-   Providing the main user interface for interacting with various project features.
-   Integrating with `fileManager.js` for file operations.
-   Using `config.js` for accessing project-wide configurations.
-   Serving as a bridge between the user and the AI-assisted coding features.

## Notes

-   The module uses environment variables for API key management (`process.env.CLAUDE_KEY`).
-   It's designed to be flexible and can be easily extended with additional user interaction features.
-   The chat interface is particularly powerful, allowing for dynamic project updates and AI-assisted development tasks.

---

This documentation provides a comprehensive overview of the `userInterface.js` file, its role in the CodeCraftAI project, and how to use its various methods. It should help developers understand the module's functionality and how to integrate it into the broader project workflow.
