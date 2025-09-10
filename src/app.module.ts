import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvFilePath } from './api/v1/utils/environment';

const envFilePath = getEnvFilePath(process.env.NODE_ENV);
dotenv.config({ path: envFilePath });

/**
 * The root Module for the backend service. Hosts the {@link ApiModule}.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Import the ConfigModule
      useFactory: async (configService: ConfigService) => {
      const mongoDBUrl = configService.get<string>('MONGO_URL');
      console.log('mongoDBUrl:', mongoDBUrl);
      return {
        uri: mongoDBUrl,
      }},
      inject: [ConfigService], // Inject the ConfigService into the factory
    }),
    ApiModule,
    RabbitMQModule,
    RedisModule,
  ],
})
export class AppModule {}
