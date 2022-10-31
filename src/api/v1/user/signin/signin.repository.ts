import * as R from 'ramda';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import * as grpc from 'grpc';
import { Signin } from './signin.entity';

@EntityRepository(Signin)
export class SigninRepository extends BaseRepository<Signin> {
  async createSignin(email: string, password: string): Promise<Signin> {
    const newSigin = new Signin();
    newSigin.email = email;
    newSigin.hash = await bcrypt.hash(password, 10);
    await this.save(newSigin);

    return newSigin;
  }

  async changeUserPassword(email: string, newPassword: string): Promise<boolean> {
    const response = await this.update(
      { email },
      { hash: await bcrypt.hash(newPassword, 10) }
    );

    const { affected } = response;
    if (affected === 0) {
      throw new RpcException({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Update user password failed'
      });
    }
    const updatedSignin = await this.findOne({ email });

    return R.pick(
      [
        'signinId',
        'email'
      ]
    )(updatedSignin);
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const signinData = await this.findOne(
      {
        email,
      }
    );

    return bcrypt.compare(password, signinData.hash);
  }
}
