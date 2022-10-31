import { RpcException } from '@nestjs/microservices';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import * as grpc from 'grpc';
import { User, UserRole } from './entities/user.entity';
import { naas } from '../proto/naas.auth';

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {
  async createUser(
    email: string,
    settings: naas.auth.user.IUserSettings,
    isAdmin: boolean,
  ): Promise<User> {
    const newUser = new User();
    newUser.email = email;
    newUser.settings = settings;
    newUser.joined = new Date();
    if (isAdmin) {
      newUser.role = UserRole.ADMIN;
    }
    await this.save(newUser);
    return newUser;
  }

  async changeUserEmail(userId: string, email: string): Promise<User> {
    const response = await this.update(
      { userId },
      { email }
    );

    const { affected } = response;
    if (affected === 0) {
      throw new RpcException({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Update stripe to user failed'
      });
    }
    const updatedUser = await this.findOne({ userId });

    return updatedUser;
  }
}
