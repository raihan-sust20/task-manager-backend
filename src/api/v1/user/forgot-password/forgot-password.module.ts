import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SigninModule } from '../signin/signin.module';
import { SigninService } from '../signin/signin.service';
import { UserModule } from '../user.module';
import { ForgotPasswordController } from './forgot-password.controller';
import { ForgotPasswordRepository } from './forgot-password.repository';
import { ForgotPasswordService } from './forgot-password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForgotPasswordRepository]),
    forwardRef(() => SigninModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService, SigninService]
})
export class ForgotPasswordModule {}
