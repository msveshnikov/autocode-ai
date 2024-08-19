# CodeGenerator.js Documentation

## Overview

`CodeGenerator.js` is a core module in the project that handles the generation and modification of code files. It interacts with the Anthropic API to leverage AI for code generation, README updates, file splitting, and code optimization. This module is designed to work within the project structure, considering other components like `FileManager` and `config.js`.

## Dependencies

-   `@anthropic-ai/sdk`: For interacting with the Anthropic API
-   `chalk`: For console text styling
-   `inquirer`: For user prompts
-   `path`: For file path operations
-   `FileManager`: Custom module for file operations
-   `CONFIG`: Configuration object imported from `config.js`

## Main Object: CodeGenerator

### Methods

#### 1. generate(readme, currentCode, fileName, projectStructure)

Generates or updates a code file based on README instructions and project structure.

**Parameters:**

-   `readme` (string): Content of the README.md file
-   `currentCode` (string): Current content of the file (if exists)
-   `fileName` (string): Name of the file to generate/update
-   `projectStructure` (object): Current project structure

**Returns:**

-   Promise<string>: Generated or updated code content

**Usage Example:**

```javascript
const newCode = await CodeGenerator.generate(readmeContent, existingCode, "index.js", projectStructure);
```

#### 2. updateReadme(readme, projectStructure)

Updates the README.md file with new design ideas based on the current project structure.

**Parameters:**

-   `readme` (string): Current content of the README.md file
-   `projectStructure` (object): Current project structure

**Returns:**

-   Promise<string>: Updated README content

**Usage Example:**

```javascript
const updatedReadme = await CodeGenerator.updateReadme(currentReadme, projectStructure);
```

#### 3. splitLargeFile(filePath, content, projectStructure)

Splits a large file into smaller, more manageable parts.

**Parameters:**

-   `filePath` (string): Path of the file to split
-   `content` (string): Content of the file to split
-   `projectStructure` (object): Current project structure

**Returns:**

-   Promise<void>

**Usage Example:**

```javascript
await CodeGenerator.splitLargeFile("/path/to/large/file.js", fileContent, projectStructure);
```

#### 4. parseSplitSuggestion(suggestion)

Parses the AI-generated file splitting suggestion.

**Parameters:**

-   `suggestion` (string): AI-generated splitting suggestion

**Returns:**

-   object: Parsed files with their contents

#### 5. saveFiles(originalFilePath, files)

Saves the split files to the file system.

**Parameters:**

-   `originalFilePath` (string): Path of the original file
-   `files` (object): Object containing file names and their contents

**Returns:**

-   Promise<void>

#### 6. optimizeAndRefactorFile(filePath, projectStructure)

Optimizes and refactors a given file using AI suggestions.

**Parameters:**

-   `filePath` (string): Path of the file to optimize
-   `projectStructure` (object): Current project structure

**Returns:**

-   Promise<void>

**Usage Example:**

```javascript
await CodeGenerator.optimizeAndRefactorFile("/path/to/file.js", projectStructure);
```

## Integration with Project Structure

`CodeGenerator.js` works closely with other modules in the project:

-   It uses `FileManager` for reading and writing files.
-   It relies on `config.js` for configuration settings like `maxFileLines` and API model details.
-   It's likely called by `index.js` or `userInterface.js` to perform code generation tasks.
-   It considers the entire project structure when generating or modifying code to ensure consistency and avoid duplication.

## Error Handling

The module uses `console.log` with `chalk` to provide colorful feedback about its operations. However, it doesn't explicitly handle errors, so it's recommended to implement try-catch blocks when using these methods in other parts of the application.

## Note on API Usage

This module requires an Anthropic API key to be set in the environment variable `CLAUDE_KEY`. Ensure this is properly set before using the CodeGenerator functions.
