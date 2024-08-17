# CodeCraftAI

CodeCraftAI is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. CodeCraftAI was bootstrapped by itself from one simple prompt.

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

1. Create a .env file in the project root and add your Claude API key:

```
CLAUDE_KEY=your_api_key_here
```

2. Navigate to your project folder in the terminal.

3. Run the following command:

```
npm link
npx codecraft-ai
```

4. Follow the prompts and watch as your project comes to life!

## How It Works

CodeCraftAI reads your README.md file and your sources and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. CodeCraftAI then saves the generated code back to your project directory. If you develop CodeCraftAI itself, use git commit often and restart process to bring your new code to life.

## Requirements

-   Node.js (version 20.0.0 or higher), always use ES6 imports and async/await
-   Always pass previous index.js (along with README.md contents) for incremental improvement
-   Always use model: "claude-3-5-sonnet-20240620", max_tokens: 8192
-   Provide nice UI with chalk so all steps are transparent to user
-   Each step should improve application to the goals described in README.md
-   New design ideas and considerations should be added to README.md by the tool (similar to index.js)

## Contributing

We welcome contributions to CodeCraftAI! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

CodeCraftAI is an AI-powered tool and may require human oversight and validation. Always review the generated code before using it in production environments.
