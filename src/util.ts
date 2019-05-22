import { extname, join } from 'path';
import fs from 'fs-extra';
import YAML from 'js-yaml';

/**
 * Deep clones a JSON object
 */
export function clone(object: any) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Parses a JSON or YAML file into a JavaScript object
 */
export function readOpenApiFile(filePath: string) {
  switch (extname(filePath).toLowerCase()) {
    case '.json':
      return JSON.parse(fs.readFileSync(filePath).toString());
    case '.yaml':
    case '.yml':
      return YAML.load(fs.readFileSync(filePath).toString());
    default:
      throw new Error('File type must be either JSON or YAML');
  }
}

/**
 * Writes a structured data object into a file in JSON or YAML format.
 * @param filename
 * @param data
 */
export function writeDataFile(filename: string, data: any) {
  const serializedData =
    extname(filename) === '.json' ? JSON.stringify(data) : YAML.safeDump(data);

  try {
    fs.outputFileSync(filename, serializedData);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Writes a tree of Maps as a hierarchy of directories and files
 * @param tree A tree of Map objects.
 * @param basePath The base path to which the directory/file tree is written.
 * @param extension The YAML or JSON extension, including the period.
 */
export function writeTree(
  tree: Map<string, any>,
  basePath: string,
  extension: '.json' | '.yaml'
) {
  for (const [resourceName, data] of tree.entries()) {
    if (data instanceof Map) {
      writeTree(data, join(basePath, resourceName), extension);
    } else {
      // All elements that are not Maps are tree leaves
      writeDataFile(join(basePath, resourceName + extension), data);
    }
  }
}

/**
 * Maps the leaves of a deeply nested JSON object. Returns a new object with the mapped leaf values.
 * @param obj source object to map leaves from.
 * @param map function that maps to new leaf values.
 * @param filter condition for which leaves are mapped or otherwise left intact.
 */
export function mapJsonLeaves(
  obj: any,
  map: (k: string, value: string | number) => any,
  filter?: (key: string, value: string | number) => boolean
): any {
  const newObj: any = {};
  for (const k in obj) {
    if (Array.isArray(obj[k])) {
      newObj[k] = obj[k].map((e: any) => {
        if (typeof e === 'object') {
          return mapJsonLeaves(e, map, filter);
        } else {
          // Mapping won't be performed on primitives within arrays
          return e;
        }
      });
    } else if (typeof obj[k] === 'object') {
      newObj[k] = mapJsonLeaves(obj[k], map, filter);
    } else {
      if (!filter || filter(k, obj[k])) {
        // If filter condition is met, then use mapped value
        newObj[k] = map(k, obj[k]);
      } else {
        // Otherwise, leave unchanged
        newObj[k] = obj[k];
      }
    }
  }
  return newObj;
}

export function dirDepth(dir: string): number {
  return dir.replace(/^\/+|\/+$/g, '').split('/').length;
}

/**
 * Yields the relative path of a path to its own root.
 * @example For example, 'a/b/c' returns '../../..'.
 * @param path A slash-separated path
 */
export function backwardsPath(path: string): string {
  return '../'.repeat(dirDepth(path)).slice(0, -1);
}

/**
 * Changes the current working directory, then executes a function and
 * finally changes the directory back to its former state.
 * @param dir The target directory.
 * @param block The code block to executed.
 */
export function withCwd(dir: string, block: () => any): void {
  const cwd = process.cwd();
  process.chdir(dir);
  block();
  process.chdir(cwd);
}
