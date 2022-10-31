import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ResendActivationResponse')
export class ResendActivationResponseType {
  @Field()
  status: boolean;
}
