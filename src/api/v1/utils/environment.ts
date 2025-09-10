import * as R from 'ramda';
import { join } from 'path';

type envs = 'default' | 'dev' | 'stage' | 'prod';

export const getMicroServiceUrl = R.curry(
  (urls: Record<envs, string>, nodeEnv: string) => {
    const url = urls[nodeEnv];
    return url || urls.default;
  },
);

export const getEnvFilePath = (nodeEnv: string) => {
  if (R.isNil(nodeEnv)) {
    return join(process.cwd(), '.env.dev');
  }
  const envFiles = {
    dev: '.env.dev',
    stage: '.env.stage',
    prod: '.env',
  };
  const envFileName = envFiles[nodeEnv];

  return join(process.cwd(), envFileName);
};
