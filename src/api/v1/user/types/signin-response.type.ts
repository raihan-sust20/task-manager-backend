import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { AuthTokenDataType } from './auth-token-data.type';

@ObjectType('SigninResponse')
export class SigninResponseType {
  @Field(() => UserType)
  user: UserType;

  @Field(() => AuthTokenDataType)
  authTokenData: AuthTokenDataType;
}
