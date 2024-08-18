# CodeCraft AI - Project Documentation

## Overview

CodeCraft AI is an innovative automatic coding tool that generates projects from README.md files using the Claude 3.5 Sonnet API. This documentation covers the `package.json` file, which defines the project configuration, dependencies, and scripts.

## Project Configuration

### Basic Information

- **Name**: codecraft-ai
- **Version**: 0.7.0
- **Description**: An innovative automatic coding tool that generates projects from README.md using Claude 3.5 Sonnet API
- **Main File**: index.js
- **Type**: module (Uses ECMAScript modules)

### Binary

The project can be run as a command-line tool:

```json
"bin": {
    "codecraft-ai": "./index.js"
}
```

This allows users to run the tool using the `codecraft-ai` command after installation.

### Scripts

- **start**: Runs the main application
  ```
  npm start
  ```

- **lint**: Runs ESLint to check code quality
  ```
  npm run lint
  ```

### Keywords

The project is tagged with the following keywords:
- ai
- code generation
- automation
- project bootstrap

### Author and License

- **Author**: Max Sveshnikov
- **License**: MIT

### Engine Requirements

The project requires Node.js version 20.0.0 or higher:

```json
"engines": {
    "node": ">=20.0.0"
}
```

## Dependencies

### Production Dependencies

1. **@anthropic-ai/sdk** (v0.26.1): SDK for interacting with the Anthropic AI API
2. **chalk** (v5.3.0): Terminal string styling
3. **inquirer** (v10.1.8): A collection of common interactive command-line user interfaces

### Development Dependencies

1. **@eslint/js** (v9.9.0): ESLint's official JavaScript integration
2. **eslint** (v9.9.0): Tool for identifying and reporting on patterns in JavaScript
3. **eslint-config-standard** (v17.1.0): JavaScript Standard Style ESLint config
4. **globals** (v15.9.0): Global identifiers from different JavaScript environments

## Usage

To use this project:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the application:
   ```
   npm start
   ```
   or
   ```
   codecraft-ai
   ```

## Development

To contribute to the project:

1. Fork the repository
2. Make your changes
3. Run linting to ensure code quality:
   ```
   npm run lint
   ```
4. Submit a pull request

## Version History

The current version is 0.7.0. Refer to the project's changelog or release notes for information on updates and changes in each version.