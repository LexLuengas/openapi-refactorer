import { join, dirname } from 'path';
import { OpenApiRefactorer } from '../src/refactorer';
import { OpenApiResolver } from '../src/resolver';
import { writeDataFile, writeTree } from '../src/util';
import tmp, { DirResult } from 'tmp';
import fs from 'fs';
import { difference } from './util';

jest.setTimeout(10000);

let tmpDir: DirResult;

beforeEach(() => {
  tmpDir = tmp.dirSync({
    mode: 0o755,
    prefix: 'NodeTmpDir_',
    keep: true,
  });
});

afterEach(() => {
  tmpDir.removeCallback();
});

const files = fs.readdirSync(join(__dirname, 'openapi_files'));
const ISSUE_FILES = ['github.yaml'];

describe.each(files)('ensure invertibility of test file "%s"', file => {
  const testFn = !ISSUE_FILES.includes(file) ? test : test.skip;

  testFn(`resolving inverts refactoring in "${file}"`, async () => {
    const sourceApiDoc = join(__dirname, 'swagger', file);
    const targetApiDoc = join(tmpDir.name, 'test.yaml');

    const refactorer = new OpenApiRefactorer(sourceApiDoc, targetApiDoc);
    const refactoredApiDoc = refactorer.refactor();

    writeDataFile(targetApiDoc, refactoredApiDoc.result);
    writeTree(refactoredApiDoc.references, dirname(targetApiDoc), '.yaml');

    const resolver = new OpenApiResolver(targetApiDoc);
    const resolvedApiDoc = await resolver.resolve();

    const diff = difference(refactorer.apiDoc, resolvedApiDoc);
    expect(diff).toStrictEqual({});
  });
});
