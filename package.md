# CodeCraft AI - Project Documentation

## Overview

CodeCraft AI is an innovative automatic coding tool that generates projects from README.md files using the Claude 3.5 Sonnet API. This document provides details about the project configuration as defined in the `package.json` file.

## Project Configuration

### Basic Information

- **Name**: codecraft-ai
- **Version**: 0.7.0
- **Description**: An innovative automatic coding tool that generates projects from README.md using Claude 3.5 Sonnet API
- **Main File**: index.js
- **Type**: module (Uses ECMAScript modules)

### Command Line Interface

The project can be run as a command-line tool:

```json
"bin": {
    "codecraft-ai": "./index.js"
}
```

This allows users to run the tool using the command `codecraft-ai` in their terminal after installation.

### Scripts

- **Start**: `npm start` or `yarn start` will run `node index.js`
- **Lint**: `npm run lint` or `yarn lint` will run ESLint on the project

### Keywords

The project is tagged with the following keywords:
- ai
- code generation
- automation
- project bootstrap

### Author and License

- **Author**: Max Sveshnikov
- **License**: MIT

### Node.js Version Requirement

The project requires Node.js version 20.0.0 or higher:

```json
"engines": {
    "node": ">=20.0.0"
}
```

### Dependencies

Production dependencies:
- **@anthropic-ai/sdk**: ^0.26.1 (Anthropic AI SDK for interacting with Claude API)
- **chalk**: ^5.3.0 (Terminal string styling)
- **inquirer**: ^10.1.8 (Interactive command line user interfaces)

Development dependencies:
- **@eslint/js**: ^9.9.0
- **eslint**: ^8.57.0
- **eslint-config-standard**: ^17.1.0
- **globals**: ^15.9.0

These dev dependencies are related to code linting and style enforcement.

## Usage

To use this project:

1. Ensure you have Node.js version 20.0.0 or higher installed.
2. Clone the repository or install the package via npm:
   ```
   npm install -g codecraft-ai
   ```
3. Run the tool using:
   ```
   codecraft-ai
   ```

For development:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the project:
   ```
   npm start
   ```
4. To lint the project:
   ```
   npm run lint
   ```

## Contributing

When contributing to this project, please ensure you follow the established coding standards by running the linter before submitting pull requests:

```
npm run lint
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.