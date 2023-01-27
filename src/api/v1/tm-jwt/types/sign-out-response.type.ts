import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SignOutResponseType')
export class SignOutResponseType {
  @Field()
  isAuthenticated?: boolean;
}
