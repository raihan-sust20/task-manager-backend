import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
} from 'class-validator';
import { SignupInput } from './signup.input';

@InputType()
export class SignupUsersInput {
  @Field(() => [SignupInput])
  @IsNotEmpty()
  data: SignupInput[];
}
