import { readOpenApiFile, withCwd } from './util';
import refParser from 'json-schema-ref-parser';
import { OpenAPI } from 'openapi-types';
import { dirname, basename } from 'path';

export class OpenApiResolver {
  apiDoc: any;
  constructor(public sourcePath: string) {
    withCwd(dirname(sourcePath), () => {
      this.apiDoc = readOpenApiFile(basename(sourcePath));
    });
  }

  resolve(): Promise<OpenAPI.Document> {
    return refParser.bundle(this.sourcePath, this.apiDoc, {
      resolve: {
        http: false,
      },
    }) as Promise<OpenAPI.Document>;
  }
}
