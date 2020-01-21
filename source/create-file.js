/* eslint-disable no-console */
const assert = require('assert');
const chalk = require('chalk');
const klawSync = require('klaw-sync');
const path = require('path');

const getComponentMetadata = require('./get-component-metadata');
const writeFile = require('./write-file');

module.exports = (
  stringifier = () => '',
  {
    fileHeader = '// NOTE: Do not edit this file. It is automatically generated.',
    fileName,
    outputPath,
    prettierOptions,
    searchPath,
    fileExtension
  }
) => {
  assert(searchPath, 'Options.searchPath is required.');
  assert(outputPath, 'Options.outputPath is required.');
  assert(fileName, 'Options.fileName is required.');
  fileExtension = fileExtension ? '.' + fileExtension.trim('.') : '.jsx';
  try {
    const components = klawSync(searchPath, {
      filter: item => path.basename(item.path)[0] !== '.'
    }).reduce((accumulator, { path: filePath }) => {
      const metadata = getComponentMetadata(filePath, fileExtension);

      return Object.keys(metadata).length > 0
        ? accumulator.concat(metadata)
        : accumulator;
    }, []);

    const fileContent = `${fileHeader}\n\n${stringifier(
      components,
      outputPath,
      fileExtension
    )}\n`;

    writeFile(path.join(outputPath, fileName), fileContent, prettierOptions);
  } catch (error) {
    console.log(
      `👻  ${chalk.red('Error generating')} ${chalk.blueBright(fileName)}\n`,
      error
    );
  }
};
