import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { AuthTokenDataType } from './auth-token-data.type';
import { FirstSigninType } from '../../first-signin/types/first-signin.type';

@ObjectType()
export class SignupResponseType {
  @Field(() => UserType)
  user: UserType;

  @Field(() => FirstSigninType)
  firstSignin: FirstSigninType;

  @Field(() => AuthTokenDataType)
  authTokenData: AuthTokenDataType;
}
