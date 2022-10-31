import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as _ from 'lodash';

const env: any = dotenv.parse(fs.readFileSync('.env'));
// Expiry times are in miliseconds except accessTokenExpiry
export const accessTokenExpiry =
  _.round(_.toNumber(env.ACCESS_TOKEN_EXPIRY) / 1000) || 20 * 60; // in seconds
export const refreshTokenExpiry =
  _.toNumber(env.REFRESH_TOKEN_EXPIRY) || 3 * 24 * 60 * 60 * 1000;

export const tmJwtVerifyOptions = {
  issuer: env.ISSUER || 'task-manager-jwt-issuer@nib.gov.bd',
  subject: env.SUBJECT || 'task-manager-json-web-token',
  audience: env.AUDIENCE || 'task-manager-subscriber@nib.gov.bd',
};
export const tmJwtSignOptions = {
  ...tmJwtVerifyOptions,
  expiresIn: accessTokenExpiry,
};
