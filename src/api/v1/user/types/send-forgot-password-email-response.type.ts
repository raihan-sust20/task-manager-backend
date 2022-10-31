import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendForgotPasswordEmailResponse')
export class SendForgotPasswordEmailResponseType {
  @Field()
  status: boolean;
}
