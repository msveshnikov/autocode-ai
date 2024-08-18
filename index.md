# CodeCraftAI - index.js Documentation

## Overview

`index.js` is the main entry point for the CodeCraftAI application. It orchestrates the entire process of code generation, analysis, optimization, and documentation. The file integrates various modules to provide a comprehensive set of features for managing and improving software projects.

## Dependencies

-   fs/promises
-   path
-   @anthropic-ai/sdk
-   chalk
-   inquirer

## Imported Modules

-   CONFIG (from ./config.js)
-   FileManager (from ./fileManager.js)
-   CodeGenerator (from ./codeGenerator.js)
-   CodeAnalyzer (from ./codeAnalyzer.js)
-   DocumentationGenerator (from ./documentationGenerator.js)
-   UserInterface (from ./userInterface.js)

## Main Functions

### processFiles(files, readme, projectStructure)

Processes the selected files by generating new content based on the README and project structure.

Parameters:

-   `files`: Array of file paths to process
-   `readme`: Content of the README.md file
-   `projectStructure`: Object representing the project's file structure

### splitLargeFile(filePath, content, projectStructure)

Splits a large file into smaller, more manageable parts using AI suggestions.

Parameters:

-   `filePath`: Path of the file to split
-   `content`: Content of the file
-   `projectStructure`: Object representing the project's file structure

### parseSplitSuggestion(suggestion)

Parses the AI-generated suggestion for splitting a file.

Parameters:

-   `suggestion`: String containing the AI-generated file split suggestion

Returns:

-   Object with file names as keys and their content as values

### saveFiles(originalFilePath, files)

Saves the split files to disk.

Parameters:

-   `originalFilePath`: Path of the original file
-   `files`: Object containing new file names and their content

### addNewFile(filePath)

Creates a new file at the specified path.

Parameters:

-   `filePath`: Path where the new file should be created

### createMissingFiles(lintOutput, projectStructure)

Creates missing files based on lint output.

Parameters:

-   `lintOutput`: Output from the linter
-   `projectStructure`: Object representing the project's file structure

### optimizeAndRefactorFile(filePath, projectStructure)

Optimizes and refactors a single file using AI suggestions.

Parameters:

-   `filePath`: Path of the file to optimize and refactor
-   `projectStructure`: Object representing the project's file structure

### main()

The main function that runs the CodeCraftAI application. It provides a menu-driven interface for various actions such as processing files, adding new files, updating README, optimizing project structure, running code quality checks, generating documentation, and more.

## Usage

To run the CodeCraftAI application, execute the `index.js` file using Node.js:

```bash
node index.js
```

The application will present a menu of options for the user to choose from, allowing them to perform various actions on their project.

## Error Handling

The main function is wrapped in a try-catch block to handle any unexpected errors that may occur during execution. Errors are logged to the console in red text for easy identification.

## Project Structure

This file is part of a larger project that includes several other modules:

-   codeAnalyzer.js: Handles code analysis and optimization
-   codeGenerator.js: Generates code based on project requirements
-   config.js: Contains configuration settings for the application
-   documentationGenerator.js: Generates documentation for code files
-   fileManager.js: Manages file operations and project structure
-   userInterface.js: Handles user interaction and input/output

The `index.js` file acts as the central coordinator, utilizing these modules to provide a comprehensive code management and improvement tool.
