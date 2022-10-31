/* eslint import/no-cycle: 0 */
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../entities/user.entity';

@Entity()
@Unique(['forgotPasswordId'])
export class ForgotPassword extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  forgotPasswordId: string;

  @Column()
  userId: string;

  @Column({ type: 'timestamptz', default: new Date() })
  dateCreated: Date;

  @Column()
  oldPasswordHash: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'userId',
  })
  user: User;
}
