import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { naas } from '../../../proto/proto';
import { UpdateAuthTokenRequest } from '../tm-jwt.interface';
import { UpdateAuthTokenResponseType } from '../../types/update-auth-token-response.type';
import { AuthService } from '../../auth/auth.interface';

/**
 * Service methods for {@link JwtGuard}. Handles the gRPC communication.
 */
@Injectable()
export class MockJwtService implements OnModuleInit {
  private authService: AuthService;

  constructor(
    @Inject('AUTH_SERVICE_GRPC')
    private grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.authService = this.grpcClient.getService<AuthService>('AuthService');
  }

  getUpdateAuthTokenErrorMessage = (updateAuthTokenStatus) => {
    switch (updateAuthTokenStatus) {
      case naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus
        .NO_REFRESH_TOKEN_IN_REQUEST:
        return 'No refresh token in request';
      case naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus
        .REFRESH_TOKEN_MISMATCH:
        return 'Refresh token in request and DB did not match';
      case naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus
        .NO_REFRESH_TOKEN_FOR_USER_IN_DB:
        return 'There is no refresh token for given user in DB';
      case naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus
        .AUTH_TOKEN_UPDATE_INVALID:
        return 'Update auth token is invalid';
      case naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus
        .REFRESH_TOKEN_EXPIRED:
        return 'Refresh token is expired';
      case naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus
        .USER_SIGNED_OUT:
        return 'User is already signed out';
      default:
        return 'Auth token update failed';
    }
  };

  async updateAuthToken(
    updateAuthTokenInput: UpdateAuthTokenRequest,
  ): Promise<UpdateAuthTokenResponseType> {
    const request = new naas.auth.UpdateAuthTokenRequest({
      userId: updateAuthTokenInput.userId,
      email: updateAuthTokenInput.email,
      refreshToken: updateAuthTokenInput.refreshToken,
      idToken: updateAuthTokenInput.idToken,
    });

    const response = await this.authService
      .updateAuthToken(request)
      .toPromise();

    if (
      response.status !==
      naas.auth.UpdateAuthTokenResponse.UpdateAuthTokenResponseStatus.OK
    ) {
      throw new UnauthorizedException(
        this.getUpdateAuthTokenErrorMessage(response.status),
      );
    }
    return {
      authTokenData: {
        accessToken: response.accessToken,
        accessTokenExpiry: response.accessTokenExpiry,
        refreshToken: response.refreshToken,
        refreshTokenExpiry: response.refreshTokenExpiry,
        idToken: updateAuthTokenInput.idToken,
      },
    };
  }

  /**
   * Validate a JWT.
   * @param jwt JSON Web Token to validate against the Auth service.
   */
  async validateJwt(jwt: string): Promise<string> {
    const request = new naas.auth.ValidateJwtRequest({ jwt });
    const response = await this.authService.validateJwt(request).toPromise();

    if (
      response.status !==
      naas.auth.ValidateJwtResponse.ValidateJwtResponseStatus.OK
    ) {
      return null;
    }

    return response.email;
  }
}
