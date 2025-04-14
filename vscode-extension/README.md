# CodeFlow Annotation Extension

A VS Code extension for navigating and autocompleting CodeFlow annotations.

## Features

- Autocomplete CodeFlow annotations after typing `@codeflow `
- Navigate to annotation definitions by CMD+Click (Mac) or CTRL+Click (Windows) on parts of the path
- Open the CodeFlow project in the browser by CMD+Click on `@codeflow`

## Requirements

- Visual Studio Code v1.60.0 or higher

## Configuration

Create a `.codeflow.json` file in your project root with the following structure:

```json
{
  "PROJECT_NAME": "your-project-name"
}
```

## Usage

1. Add annotations to your code using the syntax `@codeflow path->to->element`
2. Use CMD+Click (or CTRL+Click on Windows) to navigate between annotations
3. When typing `@codeflow `, you'll get autocompletion suggestions based on existing annotations

## Development

See the development and installation instructions in the project.
