import { RpcException } from '@nestjs/microservices';

import * as grpc from 'grpc';

export const handleAxiosError = (error) => {
  const { isAxiosError, message, response } = error;
  if (isAxiosError) {
    const { data: { error, details } } = response;
    const detailsToUse = details ? `: ${details[0]}` : '';
    throw new RpcException({
      code: grpc.status.INTERNAL,
      message: `${error}${detailsToUse}`
    });
  }
  return error;
};

export const handleError = (error) => {
  const { isAxiosError, message, response } = error;
  handleAxiosError(error);
  throw new RpcException({
    code: grpc.status.UNKNOWN,
    message
  });
};
