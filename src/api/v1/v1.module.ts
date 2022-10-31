import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql/dist/graphql.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as R from 'ramda';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { NodeModule } from './node/node.module';
import { FileModule } from './file/file.module';
import { NaasWalletModule } from './naas-wallet/naas-wallet.module';
import { ZipFileModule } from './zip-file/zip-file.module';
import { DepositModule } from './deposit/deposit.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { CoinModule } from './coin/coin.module';
import { NodeProviderModule } from './node-provider/node-provider.module';
import { DeviceModule } from './device/device.module';
import { NodeProviderContractModule } from './node-provider-contract/node-provider-contract.module';
import { NodeProviderEarningModule } from './node-provider-earning/node-provider-earning.module';
import { NodeProviderOrderModule } from './node-provider-order/node-provider-order.module';
import { NodeProviderOrderTimelineModule } from './node-provider-order-timeline/node-provider-order-timeline.module';
import { FirstSigninModule } from './first-signin/first-signin.module';
import { CryptoAddressModule } from './crypto-address/crypto-address.module';
import { SlackModule } from './slack/slack.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { getEnvFilePath } from './utils/environment';
import { ScheduleModule } from '@nestjs/schedule';

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
    ScheduleModule.forRoot(),
    UserModule,
    OrderModule,
    PaymentModule,
    NodeModule,
    FileModule,
    NaasWalletModule,
    ZipFileModule,
    DepositModule,
    AffiliateModule,
    CoinModule,
    NodeProviderModule,
    DeviceModule,
    NodeProviderContractModule,
    NodeProviderEarningModule,
    NodeProviderOrderModule,
    NodeProviderOrderTimelineModule,
    FirstSigninModule,
    CryptoAddressModule,
    SlackModule,
    ContactUsModule,
    AdminModule,
  ],
  exports: [ConfigModule],
  providers: [AdminService]
})
export class V1Module {}
