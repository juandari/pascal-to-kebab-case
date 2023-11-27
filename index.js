#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

const pascalToKebab = (str) => {
  const result = str.replace('PDP', 'pdp');
  return result.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

const renamePascalToKebab = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    let kebabName = pascalToKebab(file);

    if (kebabName.includes('pdp')) kebabName = kebabName.replace('pdp', 'pdp-');

    if (stats.isDirectory()) {
      const kebabPath = path.join(dir, kebabName);
      fs.renameSync(filePath, kebabPath);
      renamePascalToKebab(kebabPath);
    } else {
      const dirArray = dir.split('/');

      if (
        kebabName === 'styles.ts' ||
        kebabName === 'types.ts' ||
        kebabName === 'loadable.ts'
      ) {
        fs.renameSync(
          filePath,
          path.join(dir, dirArray[dirArray.length - 1] + '.' + kebabName)
        );
      } else if (kebabName === 'loader.tsx') {
        fs.renameSync(
          filePath,
          path.join(dir, dirArray[dirArray.length - 1] + '-' + kebabName)
        );
      } else {
        fs.renameSync(filePath, path.join(dir, kebabName));
      }
    }
  });
};

const program = new Command();

if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program
    .arguments('<dir>')
    .description('Rename PascalCase files/folders to kebab-case')
    .action((dir) => {
      try {
        renamePascalToKebab(dir);
        console.log('Files/folders renamed successfully');
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}
