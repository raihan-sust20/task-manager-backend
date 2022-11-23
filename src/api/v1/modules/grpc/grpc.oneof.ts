import * as R from 'ramda';
import * as _ from 'lodash';

export const getOneOfData = R.curry(
  (key: string, data: Record<any, any>) => {
    const camelCasedKey = _.camelCase(key);
    return data[camelCasedKey];
  }
);

export const setOneOfData = R.curry(
  (key: string, data: Record<any, any>) => {
    const camelCasedKey = _.camelCase(key);
    return {
      [camelCasedKey]: {
        ...data
      }
    };
  }
);

export const setOneOfVariant = R.curry(
  (key: string, variant: Record<any, any>, data: Record<any, any>) => {
    const camelCasedKey = _.camelCase(key);
    return variant[camelCasedKey](
      { ...data }
    );
  }
);
