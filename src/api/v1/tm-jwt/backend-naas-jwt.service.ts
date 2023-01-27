// import {
//   Inject,
//   Injectable,
//   OnModuleInit,
//   UnauthorizedException,
// } from '@nestjs/common';
// import * as R from 'ramda';
// import { ClientGrpc } from '@nestjs/microservices';
// import { naas } from '../../proto/proto';
// import { UpdateAuthTokenRequest } from './tm-jwt.interface';
// import { UpdateAuthTokenResponseType } from '../types/update-auth-token-response.type';
// import { AuthService } from '../auth/auth.interface';

// /**
//  * Service methods for {@link JwtGuard}. Handles the gRPC communication.
//  */
// @Injectable()
// export class JwtService implements OnModuleInit {
//   private authService: AuthService;

//   constructor(
//     @Inject('AUTH_SERVICE_GRPC')
//     private grpcClient: ClientGrpc,
//   ) {}

//   onModuleInit(): void {
//     this.authService = this.grpcClient.getService<AuthService>('AuthService');
//   }
// }
