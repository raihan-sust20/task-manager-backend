import * as _ from 'lodash';

export function snakeCaseObjectKeys(obj: Record<any, any>): any {
  return _.mapKeys(obj, (value, key) => _.snakeCase(key));
}

export function camelCaseObjectKeys(obj: Record<any, any>): any {
  return _.mapKeys(obj, (value, key) => _.camelCase(key));
}
