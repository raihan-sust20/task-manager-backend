import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql/dist/graphql.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as R from 'ramda';
import { UserModule } from './user/user.module';
import { getEnvFilePath } from './utils/environment';

const envFilePath = getEnvFilePath(process.env.NODE_ENV);

/**
 * The V1 API module for the backend service. This is a GraphQL API that
 * handles users via the {@link UserModule} and nodes via the
 * {@link NodeModule}.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        autoSchemaFile: true, // save schema in memory
        uploads: {
          maxFileSize: 500000, // 500kb
          maxFiles: 1
        },
        context: ({ req, res }) => ({
          request: req,
          response: res,
        }),
        formatError: (error) => ({
          message: String(R.view(R.lensPath(['message']), error) || 'Internal server error'),
          extensions: {
            isGraphQLError: true,
            statusCode: R.view(
              R.lensPath(['extensions', 'exception', 'response', 'statusCode']),
              error,
            ) || 500,
            status: R.view(
              R.lensPath(['extensions', 'exception', 'response', 'error']),
              error
            ) || R.view(
              R.lensPath(['extensions', 'code']),
              error
            ) || error,
          },
        }),
        cors: {
          // origin: R.split(' ', configService.get('CORS_ORIGIN')) || 'http://localhost:3000',
          origin: true,
          credentials: true,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          // preflightContinue: true,
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  exports: [ConfigModule],
  // providers: [AdminService]
})
export class V1Module {}
