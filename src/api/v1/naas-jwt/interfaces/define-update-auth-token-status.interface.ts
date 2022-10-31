export enum UpdateAuthTokenResponseStatus {
  OK = 0,
  NO_REFRESH_TOKEN_IN_REQUEST = 1,
  REFRESH_TOKEN_MISMATCH = 2,
  NO_REFRESH_TOKEN_FOR_USER_IN_DB = 3,
  REFRESH_TOKEN_EXPIRED = 4,
  AUTH_TOKEN_UPDATE_INVALID = 5,
  USER_SIGNED_OUT = 6,
}

export interface IDefineUpdateAuthTokenStatusMethodOutput {
  status: UpdateAuthTokenResponseStatus;
}
