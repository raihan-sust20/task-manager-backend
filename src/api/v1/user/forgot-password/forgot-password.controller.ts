import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { naas } from '../../proto/naas.auth';
import { ForgotPasswordService } from './forgot-password.service';
import { NaasRpcExceptionFilter } from '../../exception-filter/rpc-exception.filter';

@Controller('forgot-password')
@UseFilters(NaasRpcExceptionFilter)
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @GrpcMethod('AuthService', 'SendForgotPasswordEmail')
  async sendForgotPasswordEmail(
    data: naas.auth.ISendForgotPasswordEmailRequest,
  ): Promise<naas.auth.ISendForgotPasswordEmailResponse> {
    const { email, lang } = data;
    const sendForgotPasswordEmailResult = await this.forgotPasswordService.sendForgotPasswordEmail(
      email,
      lang
    );
    return new naas.auth.SendForgotPasswordEmailResponse({
      ...sendForgotPasswordEmailResult
    });
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(
    data: naas.auth.IResetPasswordRequest,
  ): Promise<naas.auth.IResetPasswordResponse> {
    const { newPassword, forgotPasswordId } = data;
    const resetPasswordResult = await this.forgotPasswordService.resetPassword(
      newPassword,
      forgotPasswordId,
    );
    return new naas.auth.ResetPasswordResponse({
      ...resetPasswordResult
    });
  }

  @GrpcMethod('AuthService', 'ValidateForgotPassword')
  async validateForgotPassword(
    data: naas.auth.IValidateForgotPasswordRequest,
  ): Promise<naas.auth.IValidateForgotPasswordResponse> {
    const { forgotPasswordId } = data;
    const validateForgotPasswordResult = await this.forgotPasswordService.validateForgotPassword(
      forgotPasswordId,
    );
    return new naas.auth.ValidateForgotPasswordResponse({
      ...validateForgotPasswordResult
    });
  }
}
