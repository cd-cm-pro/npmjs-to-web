# Module Bundler Script

This project provides a script to bundle a specified Node.js module into a single JavaScript file using Webpack.

## Features

- Installs a specified Node.js module dynamically.
- Bundles the module into a single file using Webpack.
- Allows customization of the output file name.

## Requirements

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

### Required Package list

- fs
- webpack
- webpack-cli
- child_process

## Installation

Clone this repository and navigate to the project directory.

```bash
git clone <repository-url>
cd <project-directory>
```

## Usage

Run the script with the required arguments:

```bash
node index.js --execModuleName <module-name> [--resultFileName <output-file-name>]
```

### Arguments

- `--execModuleName` (required): The name of the Node.js module to bundle.
- `--resultFileName` (optional): The name of the output file. Defaults to `result.js`.

### Example

```bash
node index.js --execModuleName lodash --resultFileName lodash-bundle.js
```

This will:

1. Install the `lodash` module.
2. Bundle it into a single file named `lodash-bundle.js` in the `dist` directory.

## Output

The bundled file will be located in the `dist` directory.

## Notes

- Ensure that Webpack and Webpack CLI are installed globally or available in your project dependencies.
- The script will clean up and recreate the `build` and `dist` directories during execution.

## License

This project is licensed under the MIT License.
