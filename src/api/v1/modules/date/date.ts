import * as R from 'ramda';
import * as _ from 'lodash';
import * as moment from 'moment';

export const formatISODate = R.curry(
  (obj: Record<any, any>) => {
    const {
      dateCreated,
      dateUpdated,
    } = obj;
    return {
      ...obj,
      ...dateCreated && { dateCreated: dateCreated.toISOString() },
      ...dateUpdated && { dateUpdated: dateUpdated.toISOString() },
    };
  }
);

export const formatISODates = R.curry((array: Record<any, any>) => R.map(formatISODate, array));

export const createADate = R.curry((date) => (date
  ? new Date(date)
  : new Date()));

export const createHandleDatesBeforeSave = R.curry(
  (dateKeys: Record<any, any>, obj: Record<any, any>) => R.reduce((acc, key) => {
    const value = obj[key];
    acc[key] = createADate(value);
    return acc;
  },
  obj,
  dateKeys)
);

export const handleDatesBeforeSave = createHandleDatesBeforeSave([
  'dateCreated',
  'dateUpdated'
]);

export const convertDatesToISOstring = R.curry(
  (dateKeys: Record<any, any>, obj: Record<any, any>) => R.reduce((acc, key) => {
    const value = obj[key];
    if (typeof value === 'number') {
      acc[key] = moment.unix(value).toISOString();
    }
    if (typeof value === 'string') {
      acc[key] = moment(value).toISOString();
    }
    return acc;
  },
  obj,
  dateKeys)
);
