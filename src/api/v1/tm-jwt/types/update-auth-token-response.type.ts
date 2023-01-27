import { Field, ObjectType } from '@nestjs/graphql';
import { AuthTokenDataType } from './auth-token-data.type';

@ObjectType('UpdateAuthTokenResponse')
export class UpdateAuthTokenResponseType {
  @Field(() => AuthTokenDataType)
  authTokenData: AuthTokenDataType;
}
