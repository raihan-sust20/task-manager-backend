import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

export const RABBITMQ_CONNECTION = 'RABBITMQ_CONNECTION';

@Module({
  providers: [{ provide: RABBITMQ_CONNECTION, useClass: RabbitMQService }],
  exports: [RABBITMQ_CONNECTION],
})
export class RabbitMQModule {}
