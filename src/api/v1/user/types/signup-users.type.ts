import { Field, ObjectType } from '@nestjs/graphql';
import { SignupResponseType } from './signup-response.type';

@ObjectType()
export class SignupUsersType {
  @Field(() => [SignupResponseType])
  items: SignupResponseType[];
}
