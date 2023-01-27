import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  adminKey: string;

  @Field()
  division: string;

  @Field({ nullable: true })
  designation: string;
}
