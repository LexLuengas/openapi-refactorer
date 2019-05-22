"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const util_1 = require("./util");
const fromFileSystemPath = require('json-schema-ref-parser/lib/util/url')
    .fromFileSystemPath;
class OpenApiRefactorer {
    constructor(sourcePath, outputPath) {
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
        this.apiDoc = util_1.readOpenApiFile(sourcePath);
        this.outputFile = path_1.basename(this.outputPath);
        this.outputExtension = path_1.extname(this.outputPath);
    }
    /**
     * Parses an OpenAPI document and splits it into several chunks.
     * References are updated accordingly.
     */
    refactor() {
        const newApiDoc = util_1.clone(this.apiDoc);
        const refactoredPaths = this.refactorPathObject(this.apiDoc.paths, 'paths');
        newApiDoc.paths = refactoredPaths.result;
        const references = new Map([['paths', refactoredPaths.references]]);
        return { result: newApiDoc, references };
    }
    /**
     * Refactors 'paths' section belonging to an OpenApi document.
     */
    refactorPathObject(pathsObject, relativePath) {
        const paths = new Map();
        const newPathObject = {};
        for (const [path, obj] of Object.entries(pathsObject)) {
            const pathStr = path.replace(/^\//, ''); // remove heading slash
            const relativeSubPath = relativePath + '/' + pathStr + this.outputExtension;
            // the relative path of the output root starting from the `relativeSubPath`
            const relativeBackwardPath = util_1.backwardsPath(path_1.dirname(relativeSubPath)) + '/' + this.outputFile;
            paths.set(pathStr, this.updateReferences(obj, relativeBackwardPath));
            newPathObject[path] = {
                $ref: fromFileSystemPath(relativeSubPath) + '#',
            };
        }
        return { result: newPathObject, references: paths };
    }
    updateReferences(sourceObject, relativePath) {
        const isRef = (key, _value) => key === '$ref';
        return util_1.mapJsonLeaves(sourceObject, (_k, v) => relativePath + v, isRef);
    }
}
exports.OpenApiRefactorer = OpenApiRefactorer;
//# sourceMappingURL=refactorer.js.map