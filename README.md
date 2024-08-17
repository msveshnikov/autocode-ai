# CodeCraftAI

CodeCraftAI is an innovative automatic coding tool designed to bootstrap any software project incrementally, transforming README.md instructions into a fully functional software project using Claude 3.5 Sonnet API. CodeCraftAI was bootstrapped by itself from one simple prompt.

## Features

- Automatic code generation based on README.md instructions
- Utilizes Claude 3.5 Sonnet API for intelligent code generation
- Incremental project building
- NodeJS-based console application
- Easy installation and execution using npx
- Creates and modifies source files in the current folder and subfolders
- Self-updating README.md with new design ideas and considerations
- Intelligent project structure analysis and optimization
- Automatic dependency management and version control integration
- Code quality checks and suggestions
- Support for multiple programming languages and frameworks
- Automatic code documentation generation
- Unit test generation and code coverage analysis
- Visual representation of project structure and dependencies
- Automatic code optimization and refactoring suggestions
- Modular file splitting for efficient AI processing
- Comprehensive file coverage with configurable exceptions
- Integration with version control systems for automatic commits and branching

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
npx codecraft-ai
```

4. Follow the prompts and watch as your project comes to life!

## How It Works

CodeCraftAI reads your README.md file and your sources and sends the instructions to the Claude 3.5 Sonnet API. The API interprets the instructions and generates the necessary code structure, files, and content. CodeCraftAI then saves the generated code back to your project directory. If you develop CodeCraftAI itself, use git commit often and restart process to bring your new code to life.

## Requirements

- Node.js (version 20.0.0 or higher)
- ES6 imports and async/await syntax
- Claude 3.5 Sonnet API (model: "claude-3-5-sonnet-20240620", max_tokens: 8192)
- Chalk for UI enhancements
- Incremental improvement based on previous index.js and README.md contents
- User interaction for important development steps
- Automatic package installation via npm
- Adherence to DRY, KISS, and SRP principles

## Design Ideas and Considerations

- Implement a plugin system for extending functionality
- Add support for custom code generation templates
- Develop a command-line interface for advanced users
- Implement a caching system to improve performance
- Add support for code style enforcement and linting
- Implement a progress tracking system for long-running tasks
- Develop a conflict resolution system for merge conflicts
- Add support for custom AI models and APIs

## Future Enhancements

- Support for containerization and deployment automation
- AI-powered code review and security vulnerability detection
- Automatic API documentation generation
- Support for multi-language projects and polyglot programming
- Implement a chat-like interface for interactive project development
- Integration with cloud services for seamless deployment
- Develop a web-based interface for easier project management
- Implement a collaborative coding feature for team projects
- Add support for code performance analysis and optimization
- Develop an AI-powered debugging assistant
- Implement automatic code migration and upgrading tools
