import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ValidateEmailResponseType')
export class ValidateEmailResponseType {
  @Field()
  status: boolean;
}
