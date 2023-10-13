import { DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const env: any = dotenv.parse(fs.readFileSync('.env'));
const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: env.PG_HOSTNAME,
  port: env.PG_PORT,
  username: env.PG_USER,
  password: env.PG_PASSWORD,
  database: env.PG_DBNAME,
  uuidExtension: 'pgcrypto', // for uuid
  synchronize: env.TYPEORM_SYNC === 'ON',

  logging: env.TYPEORM_LOG === 'ON',
};

export = typeOrmConfig
