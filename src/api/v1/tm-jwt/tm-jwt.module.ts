import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TmJwtGuard } from './tm-jwt.guard';
import { TmJwtService } from './tm-jwt.service';

/**
 * @note Tm = Task Manager
 */
/**
 * Module for dealing with JWT authentication.
 */
@Module({
  imports: [ConfigModule],
  providers: [TmJwtGuard, TmJwtService],
  exports: [TmJwtGuard, TmJwtService],
})
export class TmJwtModule {}
