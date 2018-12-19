const assert = require('assert');
const klawSync = require('klaw-sync');
const path = require('path');

const getComponentMetadata = require('./get-component-metadata');
const handleKlawError = require('./handle-klaw-error');
const importStatement = require('./import-statement');
const writeFile = require('./write-file');

module.exports = ({
  fileHeader = '// NOTE: Do not edit this file. It is automatically generated.',
  fileName,
  outputPath,
  pagesPath,
  prettierOptions
}) => {
  assert(fileName, 'Options.fileName is required');
  assert(outputPath, 'Options.outputPath is required');
  assert(pagesPath, 'Options.pagesPath is required');

  try {
    const pages = klawSync(pagesPath, {
      filter: item => path.basename(item.path)[0] !== '.'
    }).reduce((accumulator, { path: filePath }) => {
      const metadata = getComponentMetadata(filePath);

      return Object.keys(metadata).length > 0
        ? accumulator.concat(metadata)
        : accumulator;
    }, []);

    const importStatements = pages.reduce(
      (accumulator, { componentName, folderPath }) =>
        accumulator + importStatement(componentName, outputPath, folderPath),
      ''
    );

    const exportContent = pages.map(
      page =>
        `{
        component: ${page.componentName},
        group: '${page.group}',
        name: '${page.name}',
        path: '${page.path}'
      }`
    );

    const exportStatement = `export default [\n${exportContent.join(',\n')}];`;
    const pagesFileContent = `${fileHeader}\n\n${importStatements}\n${exportStatement}\n`;

    writeFile(path.join(outputPath, fileName), pagesFileContent, prettierOptions);
  } catch (error) {
    handleKlawError(error, pagesPath);
  }
};