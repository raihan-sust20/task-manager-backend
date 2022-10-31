import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty()
  newPassword: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  forgotPasswordId: string;
}
