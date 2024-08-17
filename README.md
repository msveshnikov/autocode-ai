# CodeCraftAI

CodeCraftAI is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API.

## Features

-   Automatic code generation based on README.md instructions
-   Utilizes Claude 3.5 Sonnet API for intelligent code generation
-   Incremental project building
-   NodeJS-based console application
-   Easy installation and execution using npx
-   Creates and modifies source files in the current folder and subfolders

## Installation

No installation is required. CodeCraftAI can be run directly using npx.

## Usage

1. Set up your Claude API key:

`export CLAUDE_KEY=your_api_key_here`

2. Navigate to your project folder in the terminal.

3. Run the following command:

`npx codecraft-ai`

4. Follow the prompts and watch as your project comes to life!

## How It Works

CodeCraftAI reads your README.md file and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. CodeCraftAI then saves the generated code to your project directory.

## Requirements

-   Node.js (version 14.0.0 or higher)
-   An active internet connection
-   Claude API key

## Contributing

We welcome contributions to CodeCraftAI! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

CodeCraftAI is an AI-powered tool and may require human oversight and validation. Always review the generated code before using it in production environments.
