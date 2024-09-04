# Formatter ObjectScript

`formatter-objectscript` is a Visual Studio Code extension designed to format ObjectScript code, ensuring consistency and readability.

## Usage

Once installed, the extension will automatically activate when you open an ObjectScript file (`.cls` extension). It provides a command to format these files:

- **Format ObjectScript Files**: Run this command from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) by searching for `Format ObjectScript Files`.

## Configuration

You can customize the formatting settings for ObjectScript files by adding the following options in your `settings.json` file:

- `FormatterObjectScript.indentationSize`: Specifies the number of spaces for indentation.
  - Type: `number`
  - Default: `2`
  - Minimum: `1`
  - Description: Sets the number of spaces used for indentation.

- `FormatterObjectScript.useSpacesForIndentation`: Specifies the type of indentation.
  - Type: `boolean`
  - Default: `true`
  - Description: Determines whether to use spaces (`true`) or tabs (`false`) for indentation.
