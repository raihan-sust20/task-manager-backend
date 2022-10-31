import { naas } from '../../../proto/naas.auth';

export interface ISendForgotPasswordEmailResponse {
  status: naas.auth.SendForgotPasswordEmailResponse.SendForgotPasswordEmailResponseStatus,
}
