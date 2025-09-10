import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { RedisModule } from '../../../redis/redis.module';
import { RabbitMQModule } from '../../../rabbitmq/rabbitmq.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    RedisModule,
    RabbitMQModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
