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
@Unique(['email'])
export class Signin extends BaseEntity {
  /**
   * Primary key
   */
  @PrimaryGeneratedColumn('uuid')
  signinId: string;

  /**
   * The user's email
   */
  @Column()
  email: string;

  /**
   * Password hash
   */
  @Column()
  hash: string;

  /**
   * insert email in user before signin
   */
  @OneToOne((type) => User, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'email',
    referencedColumnName: 'email',
  })
  user: User;
}
