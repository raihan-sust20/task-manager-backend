import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Module({
  providers: [{ provide: REDIS_CLIENT, useClass: RedisService} ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
