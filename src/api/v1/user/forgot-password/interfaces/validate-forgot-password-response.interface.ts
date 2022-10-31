import { naas } from '../../../proto/naas.auth';

export interface IValidateForgotPasswordResponse {
  status: naas.auth.ValidateForgotPasswordResponse.ValidateForgotPasswordResponseStatus,
}
