import {
  Field, ID, ObjectType, registerEnumType,
} from '@nestjs/graphql';
import { naas } from '../../proto/proto';

export const { UserRole } = naas.auth.user;

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType('UserType')
export class UserType {
  @Field(() => ID)
  userId?: string;

  @Field()
  email?: string;

  @Field()
  joined?: string;

  @Field({ nullable: true })
  modified?: string;

  @Field()
  lastSignin?: string;

  @Field()
  activated?: boolean;

  @Field(() => UserRole)
  role?: number;

  @Field({ nullable: true })
  haveUnUniFiEarning?: boolean;
}
