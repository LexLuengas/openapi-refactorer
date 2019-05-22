"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_transform_1 = __importDefault(require("lodash.transform"));
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const lodash_isobject_1 = __importDefault(require("lodash.isobject"));
/**
 * Deep difference between two objects
 * https://gist.github.com/Yimiprod/7ee176597fef230d1451
 * @param  {Object} object Target comparison object
 * @param  {Object} base Object to compare with
 * @return {Object} Returns a new object representing the difference
 */
function difference(object, base) {
    function changes(object, base) {
        return lodash_transform_1.default(object, (result, value, key) => {
            if (!lodash_isequal_1.default(value, base[key])) {
                result[key] =
                    lodash_isobject_1.default(value) && lodash_isobject_1.default(base[key])
                        ? changes(value, base[key])
                        : value;
            }
        });
    }
    return changes(object, base);
}
exports.difference = difference;
//# sourceMappingURL=util.js.map