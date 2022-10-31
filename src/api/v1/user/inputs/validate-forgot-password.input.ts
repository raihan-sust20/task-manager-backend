import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ValidateForgotPasswordInput {
  @Field()
  @IsNotEmpty()
  forgotPasswordId: string;
}
