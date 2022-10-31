import { naas } from '../../../proto/naas.auth';

export interface IResetPasswordResponse {
  status: naas.auth.ResetPasswordResponse.ResetPasswordResponseStatus,
}
