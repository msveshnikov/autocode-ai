export const CONFIG = {
    licenseServerUrl: "https:/autocode.one/api",
    excludedFiles: ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"],
    excludedDirs: [".git", "node_modules"],
    excludedExtensions: [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"],
    anthropicModel: "claude-3-5-sonnet-20240620",
    maxTokens: 8192,
    maxFileLines: 500,
    languageConfigs: {
        javascript: {
            fileExtensions: [".js", ".jsx", ".ts", ".tsx"],
            linter: "eslint",
            formatter: "prettier",
            packageManager: "npm",
        },
        python: {
            fileExtensions: [".py"],
            linter: "pylint",
            formatter: "black",
            packageManager: "pip",
        },
        csharp: {
            fileExtensions: [".cs"],
            linter: "dotnet-format",
            formatter: "dotnet-format",
            packageManager: "nuget",
        },
    },
    aiAgents: {
        sqlMigrations: {
            name: "SQL Migrations Agent",
            description: "Writes database migrations and type files",
        },
        services: {
            name: "Services Agent",
            description: "Creates services that interact with the database and process data",
        },
        apiRoutes: {
            name: "API Routes Agent",
            description: "Handles input validation, auth checks, and service calls for HTTP requests",
        },
        tester: {
            name: "Tester Agent",
            description: "Writes integration tests for endpoints",
        },
        projectManager: {
            name: "Project Manager Agent",
            description:
                "Orchestrates the work of other agents, builds the app, runs tests, and performs basic UI checks",
        },
        redditPromotion: {
            name: "Reddit Promotion Agent",
            description: "Manages Reddit promotions using the /u/AutoCode community",
        },
    },
};
