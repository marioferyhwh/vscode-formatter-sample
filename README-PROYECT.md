# Formatter ObjectScript

`formatter-objectscript` is a Visual Studio Code extension designed to format ObjectScript code, ensuring consistency and readability across your projects.

## Features

- **Automatic Formatting**: Automatically format your ObjectScript `.cls` files with a single command or upon saving.
- **Customizable Indentation**: Choose between spaces or tabs for indentation, and set the indentation size.
- **Support for Multiple Extensions**: Define custom file extensions that the formatter should apply to upon saving.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or using the `Ctrl+Shift+X` keyboard shortcut.
3. Search for `formatter-objectscript` and click "Install".
4. Once installed, the extension will activate when you open a `.cls` file or any file with an extension specified in your settings.

## Usage

### Formatting on Demand

- Use the command palette (`Ctrl+Shift+P`) and search for `Format ObjectScript Files` to format the currently open file.

### Formatting on Save

- The extension can automatically format your ObjectScript files on save. This behavior is enabled by default but can be customized or disabled via the settings.

## Extension Settings

This extension contributes the following settings:

- `FormatterObjectScript.indentationSize`: Number of spaces or tabs to use for indentation. Default is 2.
- `FormatterObjectScript.useSpacesForIndentation`: Use spaces for indentation. If false, tabs will be used. Default is `true`.
- `FormatterObjectScript.enableFormattingOnSave`: Enable or disable automatic formatting when a file is saved. Default is `true`.
- `FormatterObjectScript.supportedExtensionsOnSave`: List of file extensions supported by the formatter on save. Default is `[]`.

## Activation

The extension activates under the following conditions:

- When a workspace contains files with the `.cls` extension.
- When the `ObjectScript Class` language mode is detected.

## Development

### Requirements

- [Node.js](https://nodejs.org/) 
- [TypeScript](https://www.typescriptlang.org/)
- [Visual Studio Code](https://code.visualstudio.com/)

### Building and Running

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Build the project with `npm run compile`.
4. Launch the extension in VS Code by pressing `F5`.

### Packaging

To package the extension for distribution, run the following command:

```sh
npm run generate
