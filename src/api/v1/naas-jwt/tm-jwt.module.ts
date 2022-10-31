import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TmJwtGuard } from './tm-jwt.guard';
import { TmJwtUser } from './tm-jwt.decorator';
import { TmJwtService } from './tm-jwt.service';

/**
 * Module for dealing with JWT authentication.
 */
@Module({
  imports: [ConfigModule],
  providers: [TmJwtGuard, TmJwtService],
  exports: [TmJwtGuard, TmJwtService],
})
export class TmJwtModule {}
