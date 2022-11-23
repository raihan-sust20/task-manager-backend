import { UpdateResult } from 'typeorm';
import { IRepositoryUpdateOptions } from './typeorm.interface';

const defautUpdateOptions: IRepositoryUpdateOptions = {
  returnRawOnly: true,
  returnFirst: false
};

export function handleUpdateResult(
  updateResult: UpdateResult,
  options: IRepositoryUpdateOptions,
) {
  const optionsToUse = {
    ...defautUpdateOptions,
    ...options
  };
  const { returnRawOnly, returnFirst } = optionsToUse;
  if (returnRawOnly) {
    if (returnFirst) {
      return updateResult.raw[0];
    }
    return updateResult.raw;
  }
  return updateResult;
}
