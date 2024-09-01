export const CONFIG = {
    licenseServerUrl: "https://autocode.work",
    excludedFiles: ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"],
    excludedDirs: [".git", "node_modules"],
    excludedExtensions: [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico"],
    anthropicModel: "claude-3-5-sonnet-20240620",
    maxTokens: 8192,
    maxFileLines: 700,
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
        java: {
            fileExtensions: [".java"],
            linter: "checkstyle",
            formatter: "google-java-format",
            packageManager: "maven",
        },
        ruby: {
            fileExtensions: [".rb"],
            linter: "rubocop",
            formatter: "rubocop",
            packageManager: "bundler",
        },
        go: {
            fileExtensions: [".go"],
            linter: "golangci-lint",
            formatter: "gofmt",
            packageManager: "go mod",
        },
        rust: {
            fileExtensions: [".rs"],
            linter: "clippy",
            formatter: "rustfmt",
            packageManager: "cargo",
        },
        php: {
            fileExtensions: [".php"],
            linter: "php-cs-fixer",
            formatter: "php-cs-fixer",
            packageManager: "composer",
        },
        swift: {
            fileExtensions: [".swift"],
            linter: "swiftlint",
            formatter: "swiftformat",
            packageManager: "swift package manager",
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
        landingPage: {
            name: "Landing Page Agent",
            description: "Generates a visually appealing landing page for the project",
        },
        redditPromotion: {
            name: "Reddit Promotion Agent",
            description: "Manages Reddit promotions using the /u/AutoCode community",
        },
        codeReview: {
            name: "Code Review Agent",
            description: "Provides automated code quality feedback and suggestions",
        },
        devOps: {
            name: "DevOps Agent",
            description: "Configures CI/CD pipelines and manages deployment processes",
        },
        security: {
            name: "Security Agent",
            description: "Performs security audits and suggests vulnerability fixes",
        },
        performance: {
            name: "Performance Agent",
            description: "Analyzes code for performance bottlenecks and optimizations",
        },
        internationalization: {
            name: "Internationalization Agent",
            description: "Implements multi-language support in projects",
        },
    },
    pricingTiers: {
        free: {
            name: "Free",
            price: 0,
            requestsPerDay: 10,
            features: ["Basic features"],
            devices: 3,
            support: "Community support",
        },
        premium: {
            name: "Premium",
            price: 10,
            requestsPerDay: Infinity,
            features: ["All features"],
            devices: 10,
            support: "Priority support",
        },
        enterprise: {
            name: "Enterprise",
            price: "Custom",
            requestsPerDay: Infinity,
            features: ["All features", "Custom integrations"],
            devices: Infinity,
            support: "Dedicated support team",
            onPremises: true,
        },
    },
    landingPage: {
        templatePath: "landing.html",
        theme: {
            primaryColor: "#00FFFF",
            secondaryColor: "#000080",
            backgroundColor: "#000000",
        },
    },
    contextManagement: {
        autoUpdate: true,
        maxContextSize: 200000,
    },
    sandbox: {
        enabled: true,
        versionControl: "git",
    },
    syntaxChecking: {
        autoFix: true,
        supportedLanguages: 30,
    },
    temperatureOptions: [0, 0.5, 0.7],
    tokenStoragePath: ".autocode_token",
};
