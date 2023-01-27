export interface UpdateAuthTokenRequest {
  userId: string;
  email: string;
  refreshToken: string;
  idToken: string;
}

export interface IAuthTokenData {
  accessToken?: string;
  accessTokenExpiry?: string;
  refreshToken?: string;
  refreshTokenExpiry?: string;
  idToken?: string;
}
