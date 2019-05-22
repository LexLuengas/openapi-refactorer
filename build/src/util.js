"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
/**
 * Deep clones a JSON object
 */
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.clone = clone;
/**
 * Parses a JSON or YAML file into a JavaScript object
 */
function readOpenApiFile(filePath) {
    switch (path_1.extname(filePath).toLowerCase()) {
        case '.json':
            return JSON.parse(fs_extra_1.default.readFileSync(filePath).toString());
        case '.yaml':
        case '.yml':
            return js_yaml_1.default.load(fs_extra_1.default.readFileSync(filePath).toString());
        default:
            throw new Error('File type must be either JSON or YAML');
    }
}
exports.readOpenApiFile = readOpenApiFile;
/**
 * Writes a structured data object into a file in JSON or YAML format.
 * @param filename
 * @param data
 */
function writeDataFile(filename, data) {
    const serializedData = path_1.extname(filename) === '.json' ? JSON.stringify(data) : js_yaml_1.default.safeDump(data);
    try {
        fs_extra_1.default.outputFileSync(filename, serializedData);
    }
    catch (error) {
        console.log(error);
    }
}
exports.writeDataFile = writeDataFile;
/**
 * Writes a tree of Maps as a hierarchy of directories and files
 * @param tree A tree of Map objects.
 * @param basePath The base path to which the directory/file tree is written.
 * @param extension The YAML or JSON extension, including the period.
 */
function writeTree(tree, basePath, extension) {
    for (const [resourceName, data] of tree.entries()) {
        if (data instanceof Map) {
            writeTree(data, path_1.join(basePath, resourceName), extension);
        }
        else {
            // All elements that are not Maps are tree leaves
            writeDataFile(path_1.join(basePath, resourceName + extension), data);
        }
    }
}
exports.writeTree = writeTree;
/**
 * Maps the leaves of a deeply nested JSON object. Returns a new object with the mapped leaf values.
 * @param obj source object to map leaves from.
 * @param map function that maps to new leaf values.
 * @param filter condition for which leaves are mapped or otherwise left intact.
 */
function mapJsonLeaves(obj, map, filter) {
    const newObj = {};
    for (const k in obj) {
        if (Array.isArray(obj[k])) {
            newObj[k] = obj[k].map((e) => {
                if (typeof e === 'object') {
                    return mapJsonLeaves(e, map, filter);
                }
                else {
                    // Mapping won't be performed on primitives within arrays
                    return e;
                }
            });
        }
        else if (typeof obj[k] === 'object') {
            newObj[k] = mapJsonLeaves(obj[k], map, filter);
        }
        else {
            if (!filter || filter(k, obj[k])) {
                // If filter condition is met, then use mapped value
                newObj[k] = map(k, obj[k]);
            }
            else {
                // Otherwise, leave unchanged
                newObj[k] = obj[k];
            }
        }
    }
    return newObj;
}
exports.mapJsonLeaves = mapJsonLeaves;
function dirDepth(dir) {
    return dir.replace(/^\/+|\/+$/g, '').split('/').length;
}
exports.dirDepth = dirDepth;
/**
 * Yields the relative path of a path to its own root.
 * @example For example, 'a/b/c' returns '../../..'.
 * @param path A slash-separated path
 */
function backwardsPath(path) {
    return '../'.repeat(dirDepth(path)).slice(0, -1);
}
exports.backwardsPath = backwardsPath;
/**
 * Changes the current working directory, then executes a function and
 * finally changes the directory back to its former state.
 * @param dir The target directory.
 * @param block The code block to executed.
 */
function withCwd(dir, block) {
    const cwd = process.cwd();
    process.chdir(dir);
    block();
    process.chdir(cwd);
}
exports.withCwd = withCwd;
//# sourceMappingURL=util.js.map