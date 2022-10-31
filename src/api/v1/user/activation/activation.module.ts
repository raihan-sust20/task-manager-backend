import * as AWS from 'aws-sdk';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivationRepository } from './activation.repository';
import { ActivationService } from './activation.service';
import { ActivationController } from './activation.controller';
import { UserModule } from '../user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivationRepository]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          SES: new AWS.SES({
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
            region: configService.get('AWS_REGION')
          })
        },
        defaults: {
          from: configService.get('ADMIN_EMAIL'),
        },
        template: {
          dir: 'templates',
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule],
  providers: [ActivationService],
  controllers: [ActivationController],
})
export class ActivationModule {}
