import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SigninRepository } from './signin.repository';
import { SigninService } from './signin.service';

@Module({
  imports: [TypeOrmModule.forFeature([SigninRepository])],
  exports: [TypeOrmModule],
  providers: [SigninService],
})
export class SigninModule {}
