import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ResetPasswordResponse')
export class ResetPasswordResponseType {
  @Field()
  status: boolean;
}
