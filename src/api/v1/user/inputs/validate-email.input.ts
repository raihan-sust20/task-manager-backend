import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class ValidateEmailInput {
  @Field()
  @IsNotEmpty()
  email: string;
}
