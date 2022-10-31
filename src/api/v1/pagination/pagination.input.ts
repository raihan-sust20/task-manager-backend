import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field()
  page: number;

  @Field()
  limit: number;
}
