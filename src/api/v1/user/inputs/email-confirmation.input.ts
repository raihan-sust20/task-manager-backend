import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class EmailConfirmationInput {
  @Field()
  email: string;

  @Field(() => ID)
  nonce: string;
}
