# InternationalizationAgent.js Documentation

## Overview

The `InternationalizationAgent` is a sophisticated module designed to automate the internationalization (i18n) process for a JavaScript/React project. It discovers and transforms string files, generates language support infrastructure, and updates project documentation with internationalization details.

## Dependencies

- `fs/promises`: For file system operations
- `path`: For handling file paths
- `chalk`: For colorful console logging
- `FileManager`: Custom file management utility

## Main Methods

### `run(projectStructure, readme)`
Primary method to execute the internationalization process.

**Parameters:**
- `projectStructure` (Object): Represents the project's file and directory structure
- `readme` (String): Existing README.md content

**Process:**
1. Retrieve supported languages
2. Find string files in the project
3. Internationalize each string file
4. Generate a language selection component
5. Update README with internationalization information

**Example:**
```javascript
await InternationalizationAgent.run(projectStructure, existingReadmeContent);
```

### `getSupportedLanguages()`
Retrieves supported languages from configuration or uses default languages.

**Returns:**
- Array of language codes (e.g., `["en", "es", "fr", "de", "ja"]`)

**Configuration:**
- Checks for `i18n.config.json` in project root
- Falls back to default languages if config is not found

### `findStringFiles(projectStructure)`
Recursively searches project structure for JavaScript files containing string definitions.

**Parameters:**
- `projectStructure` (Object): Project's file and directory structure

**Returns:**
- Array of file paths containing string definitions

**Detection Criteria:**
- Files ending with `.js`
- Contains `export const strings` or `export default {`

### `internationalizeFile(file, languages)`
Transforms a single file to support multiple languages.

**Parameters:**
- `file` (String): Path to the file
- `languages` (Array): List of language codes

**Process:**
1. Read file content
2. Extract strings
3. Create internationalized string mappings
4. Update file content with i18n implementation

### `createI18nStrings(strings, languages)`
Generates language-specific string mappings.

**Parameters:**
- `strings` (Array): List of original strings
- `languages` (Array): Target languages

**Returns:**
- Object with language-specific string mappings

### `generateLanguageSelectionComponent(languages)`
Creates a React component for language selection.

**Parameters:**
- `languages` (Array): Supported language codes

**Output:**
- Generates `src/components/LanguageSelector.js`

### `updateReadmeWithI18nInfo(readme, languages)`
Appends internationalization information to README.

**Parameters:**
- `readme` (String): Existing README content
- `languages` (Array): Supported language codes

**Process:**
- Adds section describing supported languages
- Provides guidance on translation management

## Project Context

In the given project structure, this agent plays a crucial role in:
- Preparing multilingual support
- Standardizing string management
- Facilitating easy language switching

## Usage Recommendations

1. Create an optional `i18n.config.json` to specify custom languages
2. Ensure string files follow the expected export pattern
3. Use generated `LanguageSelector` component for runtime language changes

## Configuration Example

`i18n.config.json`:
```json
{
  "supportedLanguages": ["en", "es", "fr", "de", "ja", "zh"]
}
```

## Potential Improvements
- Add translation service integration
- Implement more sophisticated string extraction
- Support for more complex internationalization scenarios

## Dependencies
- Requires `i18next` for runtime language management
- Depends on `FileManager` for file operations

## Error Handling
- Gracefully handles missing configuration
- Provides fallback to default language set
- Logs informative messages during the process