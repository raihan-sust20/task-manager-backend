import { IAuthToken } from './auth-token.interface';

export interface ICreateAuthTokenData {
  userId?: string;
  email?: string;
  role?: string;
}

export interface IUpdateAuthTokenRequest extends ICreateAuthTokenData {
  refreshToken?: string;
  idToken?: string;
}

export interface IUpdateAuthTokenResponse extends IAuthToken {
  status: naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus;
}
