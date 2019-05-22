import { OpenAPI } from 'openapi-types';
export declare class OpenApiResolver {
    sourcePath: string;
    apiDoc: any;
    constructor(sourcePath: string);
    resolve(): Promise<OpenAPI.Document>;
}
