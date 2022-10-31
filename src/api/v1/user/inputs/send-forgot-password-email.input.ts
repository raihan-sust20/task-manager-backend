import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class SendForgotPasswordEmailInput {
  @Field()
  @IsNotEmpty()
  email: string;

  @Field({ defaultValue: 'en' })
  lang: string;
}
