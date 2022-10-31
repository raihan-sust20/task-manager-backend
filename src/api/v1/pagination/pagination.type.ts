import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('PaginationMeta')
export class PaginationMeta {
  @Field()
  totalItems?: number;

  @Field()
  itemCount?: number;

  @Field()
  itemsPerPage?: number;

  @Field()
  totalPages?: number;

  @Field()
  currentPage?: number;
}
