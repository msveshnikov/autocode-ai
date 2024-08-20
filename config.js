export const CONFIG = {
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
};
