import { join, dirname } from 'path';
import { OpenApiRefactorer } from '../src/refactorer';
import { writeDataFile, writeTree } from '../src/util';
import tmp from 'tmp';
import fs from 'fs';
import YAML from 'js-yaml';
import { difference } from './util';

test('refactors petstore example according to its paths', async () => {
  const sourceApiDoc = join(__dirname, 'openapi_files/petstore.yaml');
  const tmpDir = tmp.dirSync({
    mode: 0o755,
    prefix: 'NodeTmpDir_',
    keep: true,
  });
  const targetApiDoc = join(tmpDir.name, 'test.yaml');

  const refactorer = new OpenApiRefactorer(sourceApiDoc, targetApiDoc);
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
  const diffResult: any = difference(
    refactoredApiDoc.result,
    refactorer.apiDoc
  );
  expect(Object.keys(diffResult)).toStrictEqual(['paths']);
  expect(Object.keys(diffResult['paths'])).toStrictEqual([
    '/pets',
    '/pets/{petId}',
  ]);
  expect(Object.keys(diffResult['paths']['/pets'])).toStrictEqual(['$ref']);
  expect(Object.keys(diffResult['paths']['/pets/{petId}'])).toStrictEqual([
    '$ref',
  ]);

  writeDataFile(targetApiDoc, refactoredApiDoc.result);
  writeTree(refactoredApiDoc.references, dirname(targetApiDoc), '.yaml');

  expect(fs.existsSync(targetApiDoc)).toBe(true);
  expect(fs.existsSync(join(dirname(targetApiDoc), 'paths/pets.yaml'))).toBe(
    true
  );
  expect(
    fs.existsSync(join(dirname(targetApiDoc), 'paths/pets/{petId}.yaml'))
  ).toBe(true);

  tmpDir.removeCallback();
});

const CHUNKS: { [k: string]: any } = {
  'pets.yaml': YAML.load(`
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
  'pets/{petId}.yaml': YAML.load(`
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
