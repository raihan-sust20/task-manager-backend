import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as R from 'ramda';
import { Repository } from 'typeorm';
import { IGetSignin } from './interfaces/get-signin.interface';
import { Signin } from './signin.entity';

@Injectable()
export class SigninService {
  constructor(
    @InjectRepository(Signin)
    private signinRepository: Repository<Signin>,
  ) {}

  async createSignin(email: string, password: string): Promise<Signin> {
    const newSigin = new Signin();
    newSigin.email = email;
    newSigin.hash = await bcrypt.hash(password, 10);
    await this.signinRepository.save(newSigin);

    return newSigin;
  }

  async getSignin(query: IGetSignin): Promise<Signin> {
    return this.signinRepository.findOne({
      where: query,
    });
  }

  async changeUserPassword(
    email: string,
    newPassword: string,
  ): Promise<Record<string, any>> {
    const response = await this.signinRepository.update(
      { email },
      { hash: await bcrypt.hash(newPassword, 10) },
    );

    const { affected } = response;
    if (affected === 0) {
      throw new BadRequestException('Update user password failed');
    }
    const updatedSignin = await this.signinRepository.findOne({
      where: { email },
    });

    return R.pick(['signinId', 'email'])(updatedSignin);
  }

  async validatePassword(email: string, newPassword: string): Promise<boolean> {
    const signinData = await this.signinRepository.findOne({
      where: {
        email,
      },
    });

    return bcrypt.compare(newPassword, signinData.hash);
  }
}
