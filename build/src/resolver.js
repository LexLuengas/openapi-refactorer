"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const json_schema_ref_parser_1 = __importDefault(require("json-schema-ref-parser"));
const path_1 = require("path");
class OpenApiResolver {
    constructor(sourcePath) {
        this.sourcePath = sourcePath;
        util_1.withCwd(path_1.dirname(sourcePath), () => {
            this.apiDoc = util_1.readOpenApiFile(path_1.basename(sourcePath));
        });
    }
    resolve() {
        return json_schema_ref_parser_1.default.bundle(this.sourcePath, this.apiDoc, {
            resolve: {
                http: false,
            },
        });
    }
}
exports.OpenApiResolver = OpenApiResolver;
//# sourceMappingURL=resolver.js.map