import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail, IsNotEmpty, IsString,
} from 'class-validator';

@InputType()
export class UpdateAuthTokenInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
