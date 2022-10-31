import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

@InputType()
export class GetActivationInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  activationId: string;
}
