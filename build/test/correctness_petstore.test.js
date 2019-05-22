"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const refactorer_1 = require("../src/refactorer");
const util_1 = require("../src/util");
const tmp_1 = __importDefault(require("tmp"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const util_2 = require("./util");
test('refactors petstore example according to its paths', async () => {
    const sourceApiDoc = path_1.join(__dirname, 'openapi_files/petstore.yaml');
    const tmpDir = tmp_1.default.dirSync({
        mode: 0o755,
        prefix: 'NodeTmpDir_',
        keep: true,
    });
    const targetApiDoc = path_1.join(tmpDir.name, 'test.yaml');
    const refactorer = new refactorer_1.OpenApiRefactorer(sourceApiDoc, targetApiDoc);
    const refactoredApiDoc = refactorer.refactor();
    const rs = refactoredApiDoc.references;
    expect(Array.from(rs.keys())).toHaveLength(1);
    expect(rs.get('paths')).toBeDefined();
    const pathsEntries = Array.from(rs.get('paths').entries());
    expect(pathsEntries).toHaveLength(2);
    expect(pathsEntries).toContainEqual(['pets', CHUNKS['pets.yaml']]);
    expect(pathsEntries).toContainEqual([
        'pets/{petId}',
        CHUNKS['pets/{petId}.yaml'],
    ]);
    // Expect the refactored api doc only to differ in its paths object and its references
    const diffResult = util_2.difference(refactoredApiDoc.result, refactorer.apiDoc);
    expect(Object.keys(diffResult)).toStrictEqual(['paths']);
    expect(Object.keys(diffResult['paths'])).toStrictEqual([
        '/pets',
        '/pets/{petId}',
    ]);
    expect(Object.keys(diffResult['paths']['/pets'])).toStrictEqual(['$ref']);
    expect(Object.keys(diffResult['paths']['/pets/{petId}'])).toStrictEqual([
        '$ref',
    ]);
    util_1.writeDataFile(targetApiDoc, refactoredApiDoc.result);
    util_1.writeTree(refactoredApiDoc.references, path_1.dirname(targetApiDoc), '.yaml');
    expect(fs_1.default.existsSync(targetApiDoc)).toBe(true);
    expect(fs_1.default.existsSync(path_1.join(path_1.dirname(targetApiDoc), 'paths/pets.yaml'))).toBe(true);
    expect(fs_1.default.existsSync(path_1.join(path_1.dirname(targetApiDoc), 'paths/pets/{petId}.yaml'))).toBe(true);
    tmpDir.removeCallback();
});
const CHUNKS = {
    'pets.yaml': js_yaml_1.default.load(`
get:
  summary: List all pets
  operationId: listPets
  tags:
    - pets
  parameters:
    - name: limit
      in: query
      description: How many items to return at one time (max 100)
      required: false
      schema:
        type: integer
        format: int32
  responses:
    '200':
      description: A paged array of pets
      headers:
        x-next:
          description: A link to the next page of responses
          schema:
            type: string
      content:
        application/json:
          schema:
            $ref: '../test.yaml#/components/schemas/Pets'
    default:
      description: unexpected error
      content:
        application/json:
          schema:
            $ref: '../test.yaml#/components/schemas/Error'
post:
  summary: Create a pet
  operationId: createPets
  tags:
    - pets
  responses:
    '201':
      description: Null response
    default:
      description: unexpected error
      content:
        application/json:
          schema:
            $ref: '../test.yaml#/components/schemas/Error'
`),
    'pets/{petId}.yaml': js_yaml_1.default.load(`
get:
  summary: Info for a specific pet
  operationId: showPetById
  tags:
    - pets
  parameters:
    - name: petId
      in: path
      required: true
      description: The id of the pet to retrieve
      schema:
        type: string
  responses:
    '200':
      description: Expected response to a valid request
      content:
        application/json:
          schema:
            $ref: '../../test.yaml#/components/schemas/Pets'
    default:
      description: unexpected error
      content:
        application/json:
          schema:
            $ref: '../../test.yaml#/components/schemas/Error'
`),
};
//# sourceMappingURL=correctness_petstore.test.js.map