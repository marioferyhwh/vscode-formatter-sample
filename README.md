
## Usage

Once installed, the extension will automatically activate when you open an ObjectScript file (`.cls` extension). It provides a command to format these files:

- **Format ObjectScript Files**: You can run this command from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) by searching for `Format ObjectScript Files`.

## Configuration

You can customize the formatting settings for ObjectScript files by adding the following options in your `settings.json` file:

- `formatterSample.indentationSize`: Specifies the number of spaces for indentation.
  - Type: `number`
  - Default: `2`
  - Minimum: `1`
  - Description: Sets the number of spaces used for indentation.

- `formatterSample.indentationType`: Specifies the type of indentation.
  - Type: `string`
  - Enum: `["space", "tab"]`
  - Default: `space`
  - Description: Determines whether to use spaces or tabs for indentation