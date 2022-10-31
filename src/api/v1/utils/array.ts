import * as R from 'ramda';

const predicate = R.curry(
  (key:string, acc: Record<any, any>, item: Record<any, any>) => {
    // get the value of the key
    const value = item[key];
    const valueInAcc = R.clone(acc[value]);
    // order of if matters
    if (valueInAcc) {
      acc[value] = R.concat(acc[value], [item]);
    }
    if (!valueInAcc) {
      acc[value] = [item];
    }
    return acc;
  },
);
export const convertArrayToObject = R.curry(
  (key: string, array: Record<any, any>) => {
    const data = R.reduce(
      predicate(key),
      {},
      array,
    );
    return data;
  },
);
