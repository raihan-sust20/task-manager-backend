import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType('ActivateUserResponse')
export class ActivateUserResponseType {
  @Field()
  status: boolean;

  @Field()
  user: UserType
}
