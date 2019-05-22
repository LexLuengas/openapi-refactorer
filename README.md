# OpenAPI Refactorer

Break monolithic OpenAPI (f.k.a. Swagger) documents into several files (and put them back together). The resulting entrypoint is a valid OpenAPI document and still compatible with [common tools](https://openapi.tools/). 

Currently only the `paths` object is used for refactoring. 

## Installation

### Install as a CLI

```bash
npm install -g openapi-refactorer
```

### Install as a Node.js Module

```bash
npm install openapi-refactorer
```

## Usage

Basic usage:

```bash
openapi-refactorer -i spider.yaml -o baby_spiders.yaml
```

> NOTE: existing files will be overwritten

### CLI Options

```
  -V, --version        output the version number
  -i, --input <file>   path of the input OpenAPI file.
  -o, --output [file]  path of the main output OpenAPI file. Required if --join option is not used. When omitted, output is sent to stdout. Missing directories within the file path will be created. Existing file are promptlessly overwritten.
  --join               whether to join/bundle the an OpenAPI file tree into one document.
  -h, --help           output usage information
```

## Example

<sub>Input file</sub>

<details>
<summary>petstore.yaml</summary>

```yaml
openapi: 3.0.0
info:
  # (...)
paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      # (...)
      responses:
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    post:
      summary: Create a pet
      operationId: createPets
      # (...)
  /pets/{petId}:
    get:
      summary: Info for a specific pet
      operationId: showPetById
      # (...)
      responses:
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Error:
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
```
</details>

<sub>Command</sub>
```bash
openapi-refactorer -i petstore.yaml -o out/main.yaml
```

<sub>Output file structure</sub>
```
out/
 ├ main.yaml
 └ paths/
    ├ pets.yaml
    └ pets/
       └ {petId}.yaml
```

<sub>Output files</sub>

<details>
<summary>main.yaml</summary>

```yaml
openapi: 3.0.0
info:
  # (...)
paths:
  /pets:
    $ref: 'paths/pets.yaml#'
  '/pets/{petId}':
    $ref: 'paths/pets/%7BpetId%7D.yaml#'
components:
  schemas:
    Error:
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
```
</details>

<details>
<summary>paths/pets.yaml</summary>

```yaml
get:
  summary: List all pets
  operationId: listPets
  # (...)
  responses:
    default:
      description: unexpected error
      content:
        application/json:
          schema:
            $ref: "../main.yaml#/components/schemas/Error"
post:
  summary: Create a pet
  operationId: createPets
  # (...)
```
</details>

<details>
<summary>paths/pets/{petId}.yaml</summary>

```yaml
get:
  summary: Info for a specific pet
  operationId: showPetById
  # (...)
  responses:
    default:
      description: unexpected error
      content:
        application/json:
          schema:
            $ref: '../../main.yaml#/components/schemas/Error'
```
</details>

## Known Issues

- When joining/bundling: If a reference points to a definition object which itself references directly to another one, the reference is completely resolved. This produces an equivalent document as the original, but not exactly the _same_ document.

## Contributing

I'm open for ideas to make OpenAPI Refactorer better. Just send a pull request or open an issue (especially it's more involved).

## License
[MIT](LICENSE) © 2019 Alexis Luengas