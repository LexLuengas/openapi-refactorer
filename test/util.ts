import transform from 'lodash.transform';
import isEqual from 'lodash.isequal';
import isObject from 'lodash.isobject';

/**
 * Deep difference between two objects
 * https://gist.github.com/Yimiprod/7ee176597fef230d1451
 * @param  {Object} object Target comparison object
 * @param  {Object} base Object to compare with
 * @return {Object} Returns a new object representing the difference
 */
export function difference(object: object, base: object): object {
  function changes(object: any, base: any) {
    return transform(object, (result: any, value: any, key: string) => {
      if (!isEqual(value, base[key])) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value;
      }
    });
  }
  return changes(object, base);
}
