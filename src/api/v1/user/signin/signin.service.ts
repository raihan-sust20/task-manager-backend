import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { IGetSignin } from './interfaces/get-signin.interface';
import { Signin } from './signin.entity';
import { SigninRepository } from './signin.repository';

@Injectable()
export class SigninService {
  constructor(
    @InjectRepository(SigninRepository)
    private signinRepository: SigninRepository,
  ) {}

  @Transactional()
  async createSignin(email: string, password: string): Promise<Signin> {
    return this.signinRepository.createSignin(email, password);
  }

  @Transactional()
  async getSignin(query: IGetSignin): Promise<Signin> {
    return this.signinRepository.findOne(query);
  }

  @Transactional()
  async changeUserPassword(email: string, newPassword: string): Promise<boolean> {
    return this.signinRepository.changeUserPassword(email, newPassword);
  }

  @Transactional()
  async validatePassword(email: string, newPassword: string): Promise<boolean> {
    return this.signinRepository.validatePassword(email, newPassword);
  }
}
