import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { CryptoAddress } from '../../crypto-address/entities/crypto-address.entity';
/* eslint import/no-cycle: 0 */

import { Order } from '../../order/entities/order.entity';
import { StripeToUser } from '../../stripe/entities/stripe-to-user.entity';
import { Node } from '../../node/entities/node.entity';
import { naas } from '../../proto/naas.auth';
import { Device } from '../../device/entities/device.entity';

const emailSubscriptions = {
  newsletter: false
};
const defaultSettings = {
  emailSubscriptions
};

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

/**
 * Entity that represents a single user.
 */
@Entity()
export class User {
  /**
   * ID is a unique, generated identifier for each record.
   */
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  /**
   * The user's email.
   */
  @Column()
  @Index({ unique: true })
  email: string;

  /**
   * When the user was created.
   */
  @Column({ type: 'timestamptz', default: new Date() })
  joined: Date;

  /**
   * When the user was last modified.
   */
  @Column({ type: 'timestamptz', nullable: true })
  modified?: Date;

  /**
   * When the user last logged in.
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastSignin?: Date;

  /**
   * The user's settings.
   */
  @Column({
    type: 'jsonb',
    default: defaultSettings,
    nullable: true
  })
  settings?: naas.auth.user.IUserSettings;

  /**
   * The user's activation status
   */
  @Column('boolean', { default: false })
  activated?: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole

  // Temporary solution for admin report
  @Column('boolean', { default: false })
  haveUnUniFiEarning?: boolean;

  /**
   * The user's order
   */
  @OneToMany(
    () => Order,
    (order) => order.user,
  )
  orders: Order[];

  /**
   * The user's stripe
   */
  @OneToMany(
    () => StripeToUser,
    (stripeToUser) => stripeToUser.user,
    { eager: true, onUpdate: 'CASCADE' }
  )
  stripes: StripeToUser[];

  /**
   * The user's node
   */
  @OneToMany(
    () => Node,
    (node) => node.user,
  )
  nodes: Node[];

   @OneToMany(
     () => Device,
     (device) => device.user,
   )
   devices: Device[];

   @OneToMany(
     () => CryptoAddress,
     (cryptoAddress) => cryptoAddress.user,
     { eager: true, onUpdate: 'CASCADE' }
   )
  cryptoAddresses: CryptoAddress[];
}
