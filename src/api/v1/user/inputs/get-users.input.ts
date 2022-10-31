import { Field, InputType } from '@nestjs/graphql';
import {
  IsObject,
} from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class GetUsersInput {
  @Field(() => GraphQLJSONObject)
  query?: Record<any, any>;
}
