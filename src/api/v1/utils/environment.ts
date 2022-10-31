import * as R from 'ramda';
import { join } from 'path';

type envs = 'default' | 'development' | 'stage' | 'production';

export const getMicroServiceUrl = R.curry(
  (urls: Record<envs, string>, nodeEnv: string) => {
    const url = urls[nodeEnv];
    return url || urls.default;
  }
);

export const getEnvFilePath = (nodeEnv) => {
  if (nodeEnv === 'development') {
    return join(process.cwd(), 'src/api/v1/.env.development');
  }

  return '.env';
};
