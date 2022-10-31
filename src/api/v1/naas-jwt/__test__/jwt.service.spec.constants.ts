import * as R from 'ramda';
import {
  mockId,
  mockKey,
  mockEmail,
  mockDateISOString,
} from '../../../mocks/mock-values.constants';

export const getUpdateAuthTokenErrorMessageNoRefreshTokenOutput = 'No refresh token in request';
export const getUpdateAuthTokenErrorMessagerefreshTokenMismatchOutput = 'Refresh token in request and DB did not match';
export const getUpdateAuthTokenErrorMessageNoRefreshForUserOutput = 'There is no refresh token for given user in DB';
export const getUpdateAuthTokenErrorMessageAuthTokenUpdateInvalidOutput = 'Update auth token is invalid';
export const getUpdateAuthTokenErrorMessageRefreshTokenExpiredOutput = 'Refresh token is expired';
export const getUpdateAuthTokenErrorMessageUserSignedOut = 'User is already signed out';
export const getUpdateAuthTokenErrorMessageDefaultOutput = 'Auth token update failed';

export const updateAuthTokenInput = {
  /** UpdateAuthTokenRequest userId */
  userId: mockId,

  /** UpdateAuthTokenRequest email */
  email: mockEmail,

  /** UpdateAuthTokenRequest refreshToken */
  refreshToken: mockId,

  /** UpdateAuthTokenRequest idToken */
  idToken: mockId,
};
export const updateAuthTokenErrorInput = R.omit(['refreshToken'], updateAuthTokenInput);
export const updateAuthTokenOutput = {
  authTokenData: {
    /** UpdateAuthTokenResponse accessToken */
    accessToken: mockKey,

    /** UpdateAuthTokenResponse accessTokenExpiry */
    accessTokenExpiry: mockDateISOString,

    /** UpdateAuthTokenResponse refreshToken */
    refreshToken: mockId,

    /** UpdateAuthTokenResponse refreshTokenExpiry */
    refreshTokenExpiry: mockDateISOString,

    idToken: mockId,
  },
};
