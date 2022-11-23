import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../entities/user.entity';

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
  name?: string;

  @Field()
  division?: string;

  @Field()
  designation?: string;

  @Field()
  joined?: string;

  @Field({ nullable: true })
  lastModified?: string;

  @Field()
  lastSignin?: string;

  @Field()
  activated?: boolean;

  @Field(() => UserRole)
  role?: string;
}
