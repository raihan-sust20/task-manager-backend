import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EMAIL_Q } from './rabbitmq.constant';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly connectionUrl;
  public rabbitMQConnection: amqp.ChannelModel;
  public emailChannel: amqp.Channel;
  public emailQ: amqp.Replies.AssertQueue;

  constructor(private readonly configService: ConfigService) {
    this.connectionUrl = this.configService.get('RABBITMQ_URL');
  }

  async onModuleInit() {
    await this.initRabbitMQ();
  }

  async initEmailConsumer() {
    await this.emailChannel.consume(EMAIL_Q, (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log(`Received message: ${messageContent}`);

        // Acknowledge the message to remove it from the queue
        this.emailChannel.ack(msg);
      }
    });
  }

  async initRabbitMQ() {
    this.rabbitMQConnection = await amqp.connect(this.connectionUrl);

    this.emailChannel = await this.rabbitMQConnection.createChannel();
    this.emailQ = await this.emailChannel.assertQueue(EMAIL_Q, {
      durable: false,
    });

    await this.initEmailConsumer();
  }

  async onModuleDestroy() {
    await this.emailChannel.close();
    await this.rabbitMQConnection.close();
  }
}
