export interface IAccessTokenData {
  accessToken? : string;
  accessTokenExpiry? : string;
}

export interface IRefreshTokenData {
  refreshToken: string;
  refreshTokenExpiry: string;
}

export interface IRefreshTokenDataInDB extends IRefreshTokenData {
  userId: string;
  isValid?: boolean;
  idToken?: string;
}

export interface IAuthToken extends IAccessTokenData {
  refreshToken?: string;
  refreshTokenExpiry?: string;
  idToken?: string;
}
