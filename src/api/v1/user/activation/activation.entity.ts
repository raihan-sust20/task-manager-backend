/* eslint import/no-cycle: 0 */
import {
  BaseEntity,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../entities/user.entity';

@Entity()
@Unique(['userId'])
export class Activation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  activationId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  referral: string;

  @OneToOne((type) => User, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'userId',
  })
  user: User;
}
