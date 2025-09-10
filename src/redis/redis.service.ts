import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redisUrl;
  public redisClient: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get('REDIS_URL');
  }

  async onModuleInit() {
     if (!this.redisUrl) {
      throw new Error('REDIS_URL is not defined in the configuration.');
    }
    
    this.redisClient = createClient ({
      url: this.redisUrl,
    });

    this.redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await this.redisClient.connect();
    
    console.log('Successfully connected to Redis!');
  }

  async onModuleDestroy() {
    await this.redisClient.close()
  }

}
