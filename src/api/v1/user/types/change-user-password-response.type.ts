import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ChangeUserPasswordResponse')
export class ChangeUserPasswordResponseType {
  @Field()
  status: boolean;
}
