#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const js_yaml_1 = __importDefault(require("js-yaml"));
const commander_1 = __importDefault(require("commander"));
const util_1 = require("./util");
const refactorer_1 = require("./refactorer");
const resolver_1 = require("./resolver");
commander_1.default
    .version('0.1.0')
    .description('Refactor monolithic OpenAPI documents into directory hierarchies.')
    .option('-i, --input <file>', 'path of the input OpenAPI file.')
    .option('-o, --output [file]', `path of the main output OpenAPI file. Required if --join option is not used. \
When omitted, output is sent to stdout. Missing directories within the file \
path will be created. Existing file are promptlessly overwritten.`)
    .option('--join', 'whether to join/bundle the an OpenAPI file tree into one document.')
    .parse(process.argv);
if (!commander_1.default.input || (!commander_1.default.output && !commander_1.default.join)) {
    // Output help and exit
    commander_1.default.help();
}
if (!['.json', '.yaml'].includes(path_1.extname(commander_1.default.input))) {
    console.log('Input file should have one of the following extensions: ".json", ".yaml"');
    process.exit();
}
if (commander_1.default.output && !['.json', '.yaml'].includes(path_1.extname(commander_1.default.output))) {
    console.log('Output file should have one of the following extensions: ".json", ".yaml"');
    process.exit();
}
if (!commander_1.default.join) {
    // By default, split file
    const refactorer = new refactorer_1.OpenApiRefactorer(commander_1.default.input, commander_1.default.output);
    const refactoredApiDoc = refactorer.refactor();
    util_1.writeDataFile(commander_1.default.output, refactoredApiDoc.result);
    util_1.writeTree(refactoredApiDoc.references, path_1.dirname(commander_1.default.output), path_1.extname(commander_1.default.output));
}
else {
    // Join split files into one
    const resolver = new resolver_1.OpenApiResolver(commander_1.default.input);
    resolver.resolve().then(doc => {
        if (commander_1.default.output) {
            util_1.writeDataFile(commander_1.default.output, doc);
        }
        else {
            const ext = path_1.extname(commander_1.default.input);
            if (ext === '.json') {
                console.log(JSON.stringify(doc));
            }
            else {
                console.log(js_yaml_1.default.safeDump(doc, { noRefs: true }));
            }
        }
    });
}
//# sourceMappingURL=main.js.map