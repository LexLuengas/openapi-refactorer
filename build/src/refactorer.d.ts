import { OpenAPI } from 'openapi-types';
import { RefactoredObject } from '../types/types';
export declare class OpenApiRefactorer {
    sourcePath: string;
    outputPath: string;
    apiDoc: OpenAPI.Document;
    outputFile: string;
    outputExtension: string;
    constructor(sourcePath: string, outputPath: string);
    /**
     * Parses an OpenAPI document and splits it into several chunks.
     * References are updated accordingly.
     */
    refactor(): RefactoredObject<OpenAPI.Document>;
    /**
     * Refactors 'paths' section belonging to an OpenApi document.
     */
    private refactorPathObject;
    private updateReferences;
}
