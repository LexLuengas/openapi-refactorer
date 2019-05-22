import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export type PathsObject = OpenAPIV2.PathsObject | OpenAPIV3.PathsObject;
export type PathItemObject =
  | OpenAPIV2.PathItemObject
  | OpenAPIV3.PathItemObject;
export type ObjectMap<T> = { [key: string]: T };

export type RefactoredObject<T> = {
  result: T;
  references: Map<string, any>;
};