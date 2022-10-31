import * as R from 'ramda';
import { RpcException } from '@nestjs/microservices';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import * as grpc from 'grpc';
import { ForgotPassword } from './forgot-password.entity';

@EntityRepository(ForgotPassword)
export class ForgotPasswordRepository extends BaseRepository<ForgotPassword> {
  async createForgotPassword(userId: string, oldPasswordHash: string): Promise<ForgotPassword> {
    await this.disableForgotPasswordByUserId(userId);

    const newForgotPassword = new ForgotPassword();
    newForgotPassword.userId = userId;
    newForgotPassword.oldPasswordHash = oldPasswordHash;
    await this.save(newForgotPassword);

    return newForgotPassword;
  }

  async disableForgotPasswordByUserId(userId: string): Promise<ForgotPassword[]> {
    const response = await this.update({
      user: {
        userId
      }
    },
    {
      active: false,
    });

    const { affected } = response;
    if (affected > 0) {
      const updatedForgotPasswords = await this.find({
        user: {
          userId
        }
      });

      return R.map(R.pick(
        [
          'forgotPasswordId',
          'userId',
          'dateCreated',
          'active',
        ]
      )(updatedForgotPasswords));
    }

    return [];
  }

  async updateForgotPassword(conditions, value): Promise<boolean> {
    const response = await this.update(conditions, value);

    const { affected } = response;
    if (affected === 0) {
      throw new RpcException({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Update forgot password failed'
      });
    }
    const updatedForgotPassword = await this.findOne(conditions);

    return R.pick(
      [
        'forgotPasswordId',
        'userId',
        'dateCreated',
        'active',
      ]
    )(updatedForgotPassword);
  }
}
