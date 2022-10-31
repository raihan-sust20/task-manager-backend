import { RpcException } from '@nestjs/microservices';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import * as grpc from 'grpc';
import { Activation } from './activation.entity';
import { IDeleteActivation } from './interfaces/delete-activation.interface';

@EntityRepository(Activation)
export class ActivationRepository extends BaseRepository<Activation> {
  async createActivaton(userId: string): Promise<Activation> {
    const newActivcation = new Activation();
    newActivcation.userId = userId;
    await this.save(newActivcation);

    return newActivcation;
  }

  async deleteActivation(query: IDeleteActivation): Promise<Activation> {
    const activation = await this.findOne(query);
    const deletedActivation = await this.delete(query);

    const { affected } = deletedActivation;
    if (affected === 0) {
      throw new RpcException({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Delete activation data failed'
      });
    }

    return activation;
  }
}
