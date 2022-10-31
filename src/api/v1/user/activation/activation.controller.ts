import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import * as grpc from 'grpc';
import { naas } from '../../proto/naas.auth';
import { ActivationService } from './activation.service';
import { NaasRpcExceptionFilter } from '../../exception-filter/rpc-exception.filter';

@Controller('activation')
@UseFilters(NaasRpcExceptionFilter)
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  @GrpcMethod('AuthService', 'ResendActivation')
  async resendActivation(
    data: naas.auth.IResendActivationRequest,
  ): Promise<naas.auth.IResendActivationResponse> {
    const { userId, lang } = data;
    const response = await this.activationService.resendActivation(userId, lang);

    if (response) {
      return new naas.auth.ResendActivationResponse({
        status: naas.auth.ResendActivationResponse.ResendActivationResponseStatus.OK
      });
    }

    throw new RpcException({
      code: grpc.status.INTERNAL,
      message: 'Send activation email failed. Unable to access email server'
    });
  }

  @GrpcMethod('AuthService', 'GetActivation')
  async getActivation(
    data: naas.auth.IGetActivationRequest,
  ): Promise<naas.auth.IGetActivationResponse> {
    const response = await this.activationService.getActivation(data);

    return new naas.auth.GetActivationResponse({
      ...response
    });
  }
}
