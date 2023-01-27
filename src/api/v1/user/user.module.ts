import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { TmJwtModule } from '../tm-jwt/tm-jwt.module';

/**
 * Module for working with Users.
 */
@Module({
  imports: [TmJwtModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
