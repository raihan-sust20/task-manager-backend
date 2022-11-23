import * as R from 'ramda';
import * as _ from 'lodash';

export const getKeyByValue = R.curry(
  (value: string, obj: any): any => R.pipe(
    R.toPairs,
    R.find((item) => item[1] === value),
    (pairs) => (_.isArray(pairs)
      ? R.head(pairs)
      : pairs)
  )(obj)
);
