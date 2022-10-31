import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ValidateForgotPasswordResponse')
export class ValidateForgotPasswordResponseType {
  @Field()
  status: boolean;
}
