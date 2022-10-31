import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class ResendActivationInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field({ defaultValue: 'en' })
  @IsString()
  lang?: string;
}
