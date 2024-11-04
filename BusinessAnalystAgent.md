# BusinessAnalystAgent.js Documentation

## Overview

`BusinessAnalystAgent.js` is a module designed to perform business analysis and generate insights for a software project. It leverages the Anthropic Claude AI to extract requirements, generate business insights, and suggest feature prioritization. The agent is part of an automated project management and analysis system.

## Dependencies

-   `path`: Node.js path manipulation module
-   `chalk`: Terminal string styling
-   `@anthropic-ai/sdk`: Anthropic AI SDK for generating insights
-   `./config.js`: Project configuration
-   `./fileManager.js`: File management utilities
-   `./userInterface.js`: User interface configuration

## Module Structure

The `BusinessAnalystAgent` is an object with the following key methods:

### `run(projectStructure, readme)`

Orchestrates the entire business analysis process.

**Parameters:**

-   `projectStructure` (Object): Detailed project file and folder structure
-   `readme` (String): Project README content

**Process:**

1. Extract requirements from README
2. Generate business insights
3. Update project documentation
4. Suggest feature prioritization

**Example:**

```javascript
await BusinessAnalystAgent.run(projectStructure, readmeContent);
```

### `extractRequirements(readme)`

Extracts key business requirements using Anthropic Claude AI.

**Parameters:**

-   `readme` (String): Project README content

**Returns:**

-   `Promise<String>`: Extracted business requirements

### `generateInsights(requirements, projectStructure)`

Generates comprehensive business insights based on requirements and project structure.

**Parameters:**

-   `requirements` (String): Extracted business requirements
-   `projectStructure` (Object): Project file and folder structure

**Returns:**

-   `Promise<String>`: Business analysis insights

**Insights Include:**

-   Potential market opportunities
-   Competitive advantages
-   Risks and challenges
-   Improvement suggestions

### `updateProjectDocumentation(insights)`

Saves business analysis insights to a Markdown file.

**Parameters:**

-   `insights` (String): Generated business insights

**Actions:**

-   Creates `/docs/business_analysis.md`
-   Writes insights with timestamp

### `suggestFeaturePrioritization(insights)`

Generates and saves a prioritized list of features based on business insights.

**Parameters:**

-   `insights` (String): Generated business insights

**Actions:**

-   Creates `/docs/prioritized_features.md`
-   Writes top 5 prioritized features with timestamp

## Configuration

-   Uses environment variable `CLAUDE_KEY` for Anthropic API authentication
-   Configurable model and temperature via `UserInterface` methods
-   Maximum token limit from `CONFIG.maxTokens`

## Project Context

In the given project structure, `BusinessAnalystAgent.js` serves as an AI-powered business analysis tool, complementing other agents like:

-   `ProductOwnerAgent.js`
-   `ProjectManagerAgent.js`
-   `MarketingAgent.js`

It generates documentation in the `/docs` directory, which can be used by other project components.

## Usage Example

```javascript
import BusinessAnalystAgent from "./BusinessAnalystAgent.js";
import fs from "fs";

async function performBusinessAnalysis() {
    const projectStructure = {
        /* project structure object */
    };
    const readme = fs.readFileSync("README.md", "utf-8");

    await BusinessAnalystAgent.run(projectStructure, readme);
}
```

## Notes

-   Requires Anthropic Claude API key
-   Generates markdown documentation
-   Provides AI-driven business insights
-   Part of an automated project management ecosystem

## Best Practices

-   Ensure README is comprehensive
-   Maintain accurate project structure
-   Regularly review and validate AI-generated insights
