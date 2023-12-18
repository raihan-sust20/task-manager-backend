// /* eslint-disable class-methods-use-this */
// import {
//   Catch,
//   HttpStatus,
//   NotFoundException,
//   HttpException,
//   UnauthorizedException,
//   InternalServerErrorException,
//   BadRequestException,
//   NotImplementedException,
//   ForbiddenException,
//   ConflictException,
//   GatewayTimeoutException,
//   ServiceUnavailableException,
//   UnprocessableEntityException
// } from '@nestjs/common';
// import { GqlExceptionFilter } from '@nestjs/graphql';
// import * as grpc from 'grpc';
// import * as R from 'ramda';

// const UNPROCESSABLE_ENTITY = 17;
// @Catch()
// export class NaasExceptionFilter implements GqlExceptionFilter {
//   catch(exception: any) {
//     const isHttpException = exception instanceof HttpException;
//     if (isHttpException) {
//       return exception;
//     }

//     const rpcToHttpMap = {
//       [grpc.status.INVALID_ARGUMENT]: (errorMessage) => {
//         throw new BadRequestException(errorMessage);
//       },
//       [grpc.status.FAILED_PRECONDITION]: (errorMessage) => {
//         throw new BadRequestException(errorMessage);
//       },
//       [grpc.status.OUT_OF_RANGE]: (errorMessage) => {
//         throw new BadRequestException(errorMessage);
//       },
//       [grpc.status.UNAUTHENTICATED]: (errorMessage) => {
//         throw new UnauthorizedException(errorMessage);
//       },
//       [grpc.status.PERMISSION_DENIED]: (errorMessage) => {
//         throw new ForbiddenException(errorMessage);
//       },
//       [grpc.status.NOT_FOUND]: (errorMessage) => {
//         throw new NotFoundException(errorMessage);
//       },
//       [grpc.status.ABORTED]: (errorMessage) => {
//         throw new ConflictException(errorMessage);
//       },
//       [grpc.status.ALREADY_EXISTS]: (errorMessage) => {
//         throw new ConflictException(errorMessage);
//       },
//       [grpc.status.RESOURCE_EXHAUSTED]: (errorMessage) => {
//         throw new HttpException({
//           status: HttpStatus.TOO_MANY_REQUESTS,
//           error: errorMessage,
//         }, HttpStatus.TOO_MANY_REQUESTS);
//       },
//       [grpc.status.CANCELLED]: (errorMessage) => {
//         throw new BadRequestException(errorMessage);
//       },
//       [grpc.status.DATA_LOSS]: () => {
//         throw new InternalServerErrorException('Whoops! Sorry, something went wrong');
//       },
//       [grpc.status.UNKNOWN]: () => {
//         throw new InternalServerErrorException('Whoops! Sorry, something went wrong');
//       },
//       [grpc.status.INTERNAL]: () => {
//         throw new InternalServerErrorException('Whoops! Sorry, something went wrong');
//       },
//       [grpc.status.CANCELLED]: (errorMessage) => {
//         throw new BadRequestException(errorMessage);
//       },
//       [grpc.status.UNIMPLEMENTED]: (errorMessage) => {
//         throw new NotImplementedException(errorMessage);
//       },
//       [grpc.status.UNAVAILABLE]: (errorMessage) => {
//         throw new ServiceUnavailableException(errorMessage);
//       },
//       [grpc.status.DEADLINE_EXCEEDED]: (errorMessage) => {
//         throw new GatewayTimeoutException(errorMessage);
//       },
//       [UNPROCESSABLE_ENTITY]: (errorMessage) => {
//         throw new UnprocessableEntityException(errorMessage);
//       },
//     };

//     // If exception is an instancd of RpcException it must have 'code' and
//     // 'details' property. Now exception with grpc status code equivalent to
//     // HTTP status code 500 we will log the error message in console and send
//     // an error message to client. For other types of error we will throw
//     // suitable HttpException with the error message from the RpcException.
//     if (R.has('code', exception) && R.has('details', exception)) {
//       if (exception.code === grpc.status.UNKNOWN) {
//         const unknownExceptionObject = JSON.parse(exception.details);
//         // log error
//         console.log({
//           code: exception.code,
//           details: unknownExceptionObject,
//         });
//         return rpcToHttpMap[exception.code]();
//       }
//       if (
//         exception.code === grpc.status.DATA_LOSS
//         || exception.code === grpc.status.INTERNAL
//       ) {
//         // log error
//         console.log({
//           code: exception.code,
//           details: exception.details,
//         });
//         return rpcToHttpMap[exception.code]();
//       }
//       return rpcToHttpMap[exception.code](exception.details);
//     }

//     // If exception is not instance of either HttpException or RpcException then
//     // it may be an exception thrown by npm package in back-end. Then we will
//     // log the error and throw an InternalServerErrorException with error message.

//     // Axios error object is big. Log some of its properties
//     const { isAxiosError } = exception;
//     if (isAxiosError) {
//       const {
//         response,
//         data
//       } = exception;
//       console.log(response);

//       const {
//         status,
//         config
//       } = response || {};
//       const { url } = config || {};

//       console.log({
//         isAxiosError,
//         url,
//         status,
//         data
//       });
//     } else {
//       console.log(exception);
//     }
//     throw new InternalServerErrorException('Whoops! Sorry, something went wrong');
//   }
// }
