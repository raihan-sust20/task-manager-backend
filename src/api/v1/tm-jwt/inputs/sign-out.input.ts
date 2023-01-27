import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

@InputType()
export class SignOutInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  idToken: string;
}
