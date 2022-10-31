import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EmailSubscriptions')
export class EmailSubscriptions {
  @Field()
  newsletter: boolean;
}

@ObjectType('UserSettings')
export class UserSettings {
  @Field(() => EmailSubscriptions)
  emailSubscriptions: EmailSubscriptions;
}
