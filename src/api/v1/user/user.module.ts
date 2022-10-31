import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { PoolModule } from '../pool/pool.module';

/**
 * Module for working with Users.
 */
@Module({
  imports: [
    JwtModule,
    AuthModule,
    PoolModule,
  ],
  providers: [UserService, UserResolver],
  exports: [AuthModule, UserService]
})
export class UserModule {}
