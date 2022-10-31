import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail, IsNotEmpty, IsString,
} from 'class-validator';

@InputType()
export class SigninInput {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field({ nullable: true })
  @IsString()
  role: string;
}
