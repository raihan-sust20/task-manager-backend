/* eslint import/no-cycle: 0 */
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from '../user/entities/user.entity';

@Entity()
export class RefreshTokenData extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  refreshToken: string;

  @Column({ type: 'timestamptz' })
  refreshTokenExpiry: string;

  @Column('uuid')
  userId: string;

  @Column('boolean', { default: true })
  isValid?: boolean;

  @Column('boolean', { default: false })
  isSignedOut?: boolean;

  @ManyToOne((type) => User, {
    onUpdate: 'CASCADE',
  })

  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'userId',
  })
  user: User;

  // The current DB has existing refresh token data with no
  // idToken. If a default value is used for idToken the unique
  // constraint is lost.So the column was made nullable.
  @Column({ type: 'uuid', nullable: true, unique: true })
  idToken?: string;
}
