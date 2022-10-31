import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class ValidatePasswordInput {
  @Field({ nullable: true })
  activationId?: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  @IsNotEmpty()
  password: string;
}
