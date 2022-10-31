import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../pagination/pagination.type';
import { UserType } from './user.type';

@ObjectType('GetUsersResponse')
export class GetUsersResponseType {
  @Field(() => [UserType])
  items?: UserType[]

  @Field()
  meta?: PaginationMeta
}
