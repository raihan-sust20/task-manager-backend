export interface IGetCurrentRefreshTokenDataMethodOutput {
  refreshToken: string;

  refreshTokenExpiry: string;

  userId: string;

  isValid?: boolean;

  isSignedOut?: boolean;

  idToken?: string;
}
