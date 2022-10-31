import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail, IsNotEmpty, IsString,
} from 'class-validator';
import { UserSettingsInput } from './user-settings.input';

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

  @Field({ defaultValue: 'en' })
  @IsString()
  lang: string;

  @Field({ nullable: true })
  @IsString()
  adminKey: string;

  @Field(() => UserSettingsInput)
  settings: UserSettingsInput;

  // TODO handle RBAC only admin should able to set skipActivationEmail
  @Field({ nullable: true })
  skipActivationEmail: boolean;

  // TODO handle RBAC only admin should able to set skipActivationEmail
  @Field({ nullable: true })
  activateUser: boolean;

  @Field({ nullable: true })
  createFirstSignin: boolean;
}
