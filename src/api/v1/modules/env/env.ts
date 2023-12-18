// import { RpcException } from '@nestjs/microservices';
// import * as R from 'ramda';
// import * as grpc from 'grpc';

// interface envVarPairs {
//     [key:string]: string | undefined
// }
// export const checkEnvVar = (envVarPair: [string, string| undefined]) => {
//   const [
//     envVarName,
//     envVarValue
//   ] = envVarPair;
//   if (!envVarValue) {
//     throw new RpcException({
//       code: grpc.status.FAILED_PRECONDITION,
//       message: `${envVarName}: Expected a non-empty string`
//     });
//   }
// };

// export const checkEnvVars = (envVarPairs:envVarPairs) => {
//   R.pipe(
//     R.toPairs,
//     R.map(
//       checkEnvVar,
//     )
//   )(envVarPairs);
// };
