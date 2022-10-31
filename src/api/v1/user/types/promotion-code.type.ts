import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('PromotionCodeType')
export class PromotionCodeType {
  @Field(() => ID)
  id?: string;

  @Field()
  name?: string;
}
