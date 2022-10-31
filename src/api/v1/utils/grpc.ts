import * as R from 'ramda';

export const getKeyByValue = R.curry(
  (value: any, obj: any): any => R.pipe(
    R.toPairs,
    R.find((item) => item[1] === value),
    R.head,
  )(obj)
);
