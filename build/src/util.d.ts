/**
 * Deep clones a JSON object
 */
export declare function clone(object: any): any;
/**
 * Parses a JSON or YAML file into a JavaScript object
 */
export declare function readOpenApiFile(filePath: string): any;
/**
 * Writes a structured data object into a file in JSON or YAML format.
 * @param filename
 * @param data
 */
export declare function writeDataFile(filename: string, data: any): void;
/**
 * Writes a tree of Maps as a hierarchy of directories and files
 * @param tree A tree of Map objects.
 * @param basePath The base path to which the directory/file tree is written.
 * @param extension The YAML or JSON extension, including the period.
 */
export declare function writeTree(tree: Map<string, any>, basePath: string, extension: '.json' | '.yaml'): void;
/**
 * Maps the leaves of a deeply nested JSON object. Returns a new object with the mapped leaf values.
 * @param obj source object to map leaves from.
 * @param map function that maps to new leaf values.
 * @param filter condition for which leaves are mapped or otherwise left intact.
 */
export declare function mapJsonLeaves(obj: any, map: (k: string, value: string | number) => any, filter?: (key: string, value: string | number) => boolean): any;
export declare function dirDepth(dir: string): number;
/**
 * Yields the relative path of a path to its own root.
 * @example For example, 'a/b/c' returns '../../..'.
 * @param path A slash-separated path
 */
export declare function backwardsPath(path: string): string;
/**
 * Changes the current working directory, then executes a function and
 * finally changes the directory back to its former state.
 * @param dir The target directory.
 * @param block The code block to executed.
 */
export declare function withCwd(dir: string, block: () => any): void;
