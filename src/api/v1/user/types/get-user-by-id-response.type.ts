import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
@ObjectType('GetUserByIdResponse')
export class GetUserByIdResponseType {
  @Field(() => UserType)
  user: UserType;
}
