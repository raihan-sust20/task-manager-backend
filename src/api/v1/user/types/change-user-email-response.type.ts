import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ChangeUserEmailResponse')
export class ChangeUserEmailResponseType {
  @Field()
  email: string;
}
