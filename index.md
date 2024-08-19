# index.js Documentation

## Overview

`index.js` is the main entry point for the CodeCraftAI application. This file orchestrates the entire workflow of the project, integrating various modules to provide a comprehensive set of features for code generation, analysis, optimization, and documentation.

The script uses Node.js and is designed to be run from the command line. It provides an interactive interface for users to perform various actions on their codebase.

## Dependencies

-   `path`: Node.js built-in module for handling file paths
-   `chalk`: For colorful console output
-   Custom modules:
    -   `CONFIG` from `./config.js`
    -   `FileManager` from `./fileManager.js`
    -   `CodeGenerator` from `./codeGenerator.js`
    -   `CodeAnalyzer` from `./codeAnalyzer.js`
    -   `DocumentationGenerator` from `./documentationGenerator.js`
    -   `UserInterface` from `./userInterface.js`

## Main Functions

### `processFiles(files, readme, projectStructure)`

Processes the selected files by generating or updating their content.

#### Parameters:

-   `files`: Array of file paths to process
-   `readme`: Content of the README.md file
-   `projectStructure`: Object representing the project's file structure

#### Functionality:

-   Reads each file's content
-   Generates new content using `CodeGenerator`
-   Writes the generated content back to the file
-   Splits large files if they exceed the maximum line count

### `main()`

The main function that runs the application loop.

#### Functionality:

-   Checks for the `CLAUDE_KEY` environment variable
-   Reads the README.md file
-   Enters a loop to prompt the user for actions and execute them
-   Handles various actions like processing files, adding new files, updating README, optimizing project structure, etc.

## Usage

To run the application:

```bash
node index.js
```

Ensure that the `CLAUDE_KEY` environment variable is set before running the application.

## Action Descriptions

1. **Process files**: Allows users to select and process multiple files.
2. **Add a new file**: Prompts the user to add a new file to the project.
3. **Update README.md**: Updates the README with new design ideas and considerations.
4. **Optimize project structure**: Analyzes and optimizes the overall project structure.
5. **Detect missing dependencies**: Checks for and reports any missing dependencies.
6. **Run code quality checks**: Performs lint checks on selected files and fixes errors.
7. **Generate project documentation**: Creates documentation for the entire project.
8. **Generate documentation**: Generates documentation for selected files.
9. **Chat interface**: Provides an interactive chat interface for project-related queries.
10. **Optimize and refactor file**: Optimizes and refactors selected files.
11. **Analyze code quality**: Performs a detailed code quality analysis on selected files.
12. **Exit**: Terminates the application.

## Error Handling

The main function is wrapped in a try-catch block to handle any unexpected errors during execution. Errors are logged to the console in red text.

## Project Structure

This file is part of a larger project that includes several modules for different functionalities:

-   `codeAnalyzer.js`: Handles code analysis and optimization
-   `codeGenerator.js`: Generates and modifies code
-   `config.js`: Contains configuration settings
-   `documentationGenerator.js`: Generates documentation
-   `fileManager.js`: Manages file operations
-   `userInterface.js`: Handles user interaction and prompts

`index.js` serves as the central coordinator, utilizing all these modules to provide a comprehensive code management and improvement tool.
