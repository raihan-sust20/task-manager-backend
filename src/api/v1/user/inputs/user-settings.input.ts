// eslint-disable-next-line max-classes-per-file
import { Field, InputType } from '@nestjs/graphql';

@InputType('EmailSubscriptionsInput')
export class EmailSubscriptionsInput {
  @Field()
  newsletter: boolean;
}

@InputType('UserSettingsInput')
export class UserSettingsInput {
  @Field(() => EmailSubscriptionsInput)
  emailSubscriptions: EmailSubscriptionsInput;
}
