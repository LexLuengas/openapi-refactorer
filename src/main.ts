#!/usr/bin/env node

import { extname, dirname } from 'path';
import YAML from 'js-yaml';
import program from 'commander';
import { writeDataFile, writeTree } from './util';
import { OpenApiRefactorer } from './refactorer';
import { OpenApiResolver } from './resolver';

program
  .version('0.1.0')
  .description(
    'Refactor monolithic OpenAPI documents into directory hierarchies.'
  )
  .option('-i, --input <file>', 'path of the input OpenAPI file.')
  .option(
    '-o, --output [file]',
    `path of the main output OpenAPI file. Required if --join option is not used. \
When omitted, output is sent to stdout. Missing directories within the file \
path will be created. Existing file are promptlessly overwritten.`
  )
  .option(
    '--join',
    'whether to join/bundle the an OpenAPI file tree into one document.'
  )
  .parse(process.argv);

if (!program.input || (!program.output && !program.join)) {
  // Output help and exit
  program.help();
}

if (!['.json', '.yaml'].includes(extname(program.input))) {
  console.log(
    'Input file should have one of the following extensions: ".json", ".yaml"'
  );
  process.exit();
}

if (program.output && !['.json', '.yaml'].includes(extname(program.output))) {
  console.log(
    'Output file should have one of the following extensions: ".json", ".yaml"'
  );
  process.exit();
}

if (!program.join) {
  // By default, split file
  const refactorer = new OpenApiRefactorer(program.input, program.output);
  const refactoredApiDoc = refactorer.refactor();

  writeDataFile(program.output, refactoredApiDoc.result);
  writeTree(refactoredApiDoc.references, dirname(program.output), extname(
    program.output
  ) as '.json' | '.yaml');
} else {
  // Join split files into one
  const resolver = new OpenApiResolver(program.input);
  resolver.resolve().then(doc => {
    if (program.output) {
      writeDataFile(program.output, doc);
    } else {
      const ext = extname(program.input);
      if (ext === '.json') {
        console.log(JSON.stringify(doc));
      } else {
        console.log(YAML.safeDump(doc, { noRefs: true }));
      }
    }
  });
}
