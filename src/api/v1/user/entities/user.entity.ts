import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

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
   * Name of the user.
   */
  @Column()
  name: string;

  /**
   * The department user work in.
   */
  @Column()
  division: string;

  /**
   * The designation of the user.
   */
  @Column()
  designation: string;

  /**
   * When the user was created.
   */
  @Column({ type: 'timestamptz', default: new Date() })
  joined: Date;

  /**
   * When the user was last modified.
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastModified?: Date;

  /**
   * When the user last logged in.
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastSignin?: Date;

  /**
   * The user's activation status
   */
  @Column('boolean', { default: false })
  activated?: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
}
