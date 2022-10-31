import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType('ValidatePasswordResponseType')
export class ValidatePasswordResponseType {
  @Field()
  status: boolean;
}
