export const CONFIG = {
    licenseServerUrl: "https://autocode.work",
    // licenseServerUrl: "http://localhost:3000",
    excludedFiles: ["package-lock.json", ".gitignore", "eslint.config.js", ".env", "reportWebVitals.js"],
    excludedDirs: [".git", "node_modules"],
    excludedExtensions: [".md", ".svg", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico", ".avif"],
    anthropicModel: "claude-3-5-sonnet-20241022",
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
        tester: {
            name: "Tester Agent",
            description: "Writes integration tests for endpoints",
        },
        projectManager: {
            name: "Project Manager Agent",
            description:
                "Orchestrates the work of other agents, builds the app, runs tests, and performs basic UI checks",
        },
        devOps: {
            name: "DevOps Agent",
            description: "Configures CI/CD pipelines and manages deployment processes",
        },
        internationalization: {
            name: "Internationalization Agent",
            description: "Implements multi-language support in projects",
        },
        marketing: {
            name: "Marketing Agent",
            description: "Develops marketing strategies and content for the project",
        },
        businessAnalyst: {
            name: "Business Analyst Agent",
            description: "Analyzes requirements and provides business insights",
        },
        productOwner: {
            name: "Product Owner Agent",
            description: "Manages product backlog and prioritizes features",
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
    contextManagement: {
        autoUpdate: true,
        maxContextSize: 200000,
    },
    temperatureOptions: [0, 0.5, 0.7, 1],
    tokenStoragePath: ".autocode_token",
};
