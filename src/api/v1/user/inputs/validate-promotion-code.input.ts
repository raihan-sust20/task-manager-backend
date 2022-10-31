import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class ValidatePromotionCodeInput {
  @Field()
  @IsNotEmpty()
  promotionCode: string;
}
