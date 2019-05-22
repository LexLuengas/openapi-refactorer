"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const refactorer_1 = require("../src/refactorer");
const resolver_1 = require("../src/resolver");
const util_1 = require("../src/util");
const tmp_1 = __importDefault(require("tmp"));
const fs_1 = __importDefault(require("fs"));
const util_2 = require("./util");
jest.setTimeout(10000);
let tmpDir;
beforeEach(() => {
    tmpDir = tmp_1.default.dirSync({
        mode: 0o755,
        prefix: 'NodeTmpDir_',
        keep: true,
    });
});
afterEach(() => {
    tmpDir.removeCallback();
});
const files = fs_1.default.readdirSync(path_1.join(__dirname, 'openapi_files'));
const ISSUE_FILES = ['github.yaml'];
describe.each(files)('ensure invertibility of test file "%s"', file => {
    const testFn = !ISSUE_FILES.includes(file) ? test : test.skip;
    testFn(`resolving inverts refactoring in "${file}"`, async () => {
        const sourceApiDoc = path_1.join(__dirname, 'swagger', file);
        const targetApiDoc = path_1.join(tmpDir.name, 'test.yaml');
        const refactorer = new refactorer_1.OpenApiRefactorer(sourceApiDoc, targetApiDoc);
        const refactoredApiDoc = refactorer.refactor();
        util_1.writeDataFile(targetApiDoc, refactoredApiDoc.result);
        util_1.writeTree(refactoredApiDoc.references, path_1.dirname(targetApiDoc), '.yaml');
        const resolver = new resolver_1.OpenApiResolver(targetApiDoc);
        const resolvedApiDoc = await resolver.resolve();
        const diff = util_2.difference(refactorer.apiDoc, resolvedApiDoc);
        expect(diff).toStrictEqual({});
    });
});
//# sourceMappingURL=invertibility.test.js.map