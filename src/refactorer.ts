import { dirname, extname, basename } from 'path';
import { OpenAPI } from 'openapi-types';
import { PathsObject, RefactoredObject } from '../types/types';
import { readOpenApiFile, clone, mapJsonLeaves, backwardsPath } from './util';
const fromFileSystemPath = require('json-schema-ref-parser/lib/util/url')
  .fromFileSystemPath;

export class OpenApiRefactorer {
  apiDoc: OpenAPI.Document;
  outputFile: string;
  outputExtension: string;

  constructor(public sourcePath: string, public outputPath: string) {
    this.apiDoc = readOpenApiFile(sourcePath);
    this.outputFile = basename(this.outputPath);
    this.outputExtension = extname(this.outputPath);
  }

  /**
   * Parses an OpenAPI document and splits it into several chunks.
   * References are updated accordingly.
   */
  refactor(): RefactoredObject<OpenAPI.Document> {
    const newApiDoc = clone(this.apiDoc);

    const refactoredPaths = this.refactorPathObject(this.apiDoc.paths, 'paths');

    newApiDoc.paths = refactoredPaths.result;
    const references = new Map([['paths', refactoredPaths.references]]);

    return { result: newApiDoc, references };
  }

  /**
   * Refactors 'paths' section belonging to an OpenApi document.
   */
  private refactorPathObject(
    pathsObject: PathsObject,
    relativePath: string
  ): RefactoredObject<PathsObject> {
    const paths: Map<string, PathsObject> = new Map();
    const newPathObject: { [pathStr: string]: any } = {};

    for (const [path, obj] of Object.entries(pathsObject)) {
      const pathStr = path.replace(/^\//, ''); // remove heading slash

      const relativeSubPath =
        relativePath + '/' + pathStr + this.outputExtension;

      // the relative path of the output root starting from the `relativeSubPath`
      const relativeBackwardPath =
        backwardsPath(dirname(relativeSubPath)) + '/' + this.outputFile;

      paths.set(pathStr, this.updateReferences(obj, relativeBackwardPath));
      newPathObject[path] = {
        $ref: fromFileSystemPath(relativeSubPath) + '#',
      };
    }

    return { result: newPathObject, references: paths };
  }

  private updateReferences(sourceObject: any, relativePath: string): any {
    const isRef = (key: string, _value: string | number) => key === '$ref';
    return mapJsonLeaves(sourceObject, (_k, v) => relativePath + v, isRef);
  }
}
