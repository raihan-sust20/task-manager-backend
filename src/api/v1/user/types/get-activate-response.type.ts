import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('GetActivationResponse')
export class GetActivationResponseType {
  @Field()
  activationId: string;

  @Field()
  userId: string;
}
