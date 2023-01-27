import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AuthTokenDataType')
export class AuthTokenDataType {
  @Field()
  accessToken?: string;

  @Field()
  accessTokenExpiry?: string;

  @Field()
  refreshToken?: string;

  @Field()
  refreshTokenExpiry?: string;

  @Field()
  idToken?: string;
}
