import * as R from 'ramda';
import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
// constants
import {
  accessTokenExpiry,
  refreshTokenExpiry,
  tmJwtSignOptions,
  tmJwtVerifyOptions,
} from './tm-jwt.constants';
// interfaces
import {
  IAccessTokenData,
  IRefreshTokenData,
  IRefreshTokenDataInDB,
  IAuthToken,
} from './interfaces/auth-token.interface';
import { ICreateAuthTokenData } from './interfaces/update-auth-token.interface';
import { IValidateJwtResponse } from './interfaces/validate-jwt.interface';
import { ISignOutMethodOutput } from './interfaces/sign-out.interface';
import { IGetCurrentRefreshTokenDataMethodOutput } from './interfaces/get-current-refresh-token-data.interface';
import {
  UpdateAuthTokenResponseStatus,
  IDefineUpdateAuthTokenStatusMethodOutput,
} from './interfaces/define-update-auth-token-status.interface';
// services
import { UserService } from '../user/user.service';
// inputs
import { UpdateAuthTokenInput } from './inputs/update-auth-token.input';
// types
import { UpdateAuthTokenResponseType } from './types/update-auth-token-response.type';
import { RefreshTokenData } from './refresh-token-data.entity';
import { Repository, UpdateResult } from 'typeorm';
import { SignOutInput } from './inputs/sign-out.input';

@Injectable()
export class TmJwtService {
  constructor(
    @InjectRepository(RefreshTokenData)
    private refreshTokenDataRepository: Repository<RefreshTokenData>,

    private readonly jwtService: JwtService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private getUpdateAuthTokenErrorMessage = (
    updateAuthTokenStatus: UpdateAuthTokenResponseStatus,
  ): string => {
    switch (updateAuthTokenStatus) {
      case UpdateAuthTokenResponseStatus.NO_REFRESH_TOKEN_IN_REQUEST:
        return 'No refresh token in request';
      case UpdateAuthTokenResponseStatus.REFRESH_TOKEN_MISMATCH:
        return 'Refresh token in request and DB did not match';
      case UpdateAuthTokenResponseStatus.NO_REFRESH_TOKEN_FOR_USER_IN_DB:
        return 'There is no refresh token for given user in DB';
      case UpdateAuthTokenResponseStatus.AUTH_TOKEN_UPDATE_INVALID:
        return 'Update auth token is invalid';
      case UpdateAuthTokenResponseStatus.REFRESH_TOKEN_EXPIRED:
        return 'Refresh token is expired';
      case UpdateAuthTokenResponseStatus.USER_SIGNED_OUT:
        return 'User is already signed out';
      default:
        return 'Auth token update failed';
    }
  };

  // async updateAuthToken(
  //   updateAuthTokenInput: UpdateAuthTokenInput,
  // ): Promise<UpdateAuthTokenResponseType> {
  //   const response = await this.updateAuthToken(updateAuthTokenInput);

  //   if (response.status !== UpdateAuthTokenResponseStatus.OK) {
  //     throw new UnauthorizedException(
  //       this.getUpdateAuthTokenErrorMessage(response.status),
  //     );
  //   }
  //   return {
  //     authTokenData: {
  //       accessToken: response.accessToken,
  //       accessTokenExpiry: response.accessTokenExpiry,
  //       refreshToken: response.refreshToken,
  //       refreshTokenExpiry: response.refreshTokenExpiry,
  //       idToken: updateAuthTokenInput.idToken,
  //     },
  //   };
  // }

  /**
   * Validate a JWT.
   * @param jwt JSON Web Token to validate against the Auth service.
   */
  // async validateJwt(
  //   jwt: string,
  // ): Promise<naas.auth.IValidateJwtResponse | null> {
  //   const request = new naas.auth.ValidateJwtRequest({ jwt });
  //   const response = await this.authService.validateJwt(request).toPromise();

  //   if (
  //     response.status !==
  //     naas.auth.ValidateJwtResponse.ValidateJwtResponseStatus.OK
  //   ) {
  //     return null;
  //   }

  //   return R.omit(['status'], response);
  // }

  async signOut(signOutRequest: SignOutInput): Promise<ISignOutMethodOutput> {
    const { userId, idToken } = signOutRequest;
    await this.refreshTokenDataRepository.update(
      { userId, idToken },
      { isSignedOut: true },
    );
    return {
      isAuthenticated: false,
    };
  }

  /**
   * Return expiration time for Refresh and Access token
   * @param  {string} tokenType Possible values are either 'access' or 'refresh'
   */
  private createTokenExpiry = (tokenType: string): string => {
    const accessTokenExpiryInt = parseInt(String(accessTokenExpiry), 10);
    const tokenExpirationTime =
      tokenType === 'access'
        ? accessTokenExpiryInt * 1000 // convert accessTokenExpiry in milisecond
        : refreshTokenExpiry;
    const tokenExpirationTimeInt = parseInt(String(tokenExpirationTime), 10);
    const tokenExpiry = new Date(
      new Date().getTime() + tokenExpirationTimeInt,
    ).toISOString();
    return tokenExpiry;
  };

  private isRefreshTokenExpired = (refreshTokenExpiry: string): boolean =>
    new Date(refreshTokenExpiry).getTime() < new Date().getTime();

  private async getCurrentRefreshTokenData(
    userId: string,
    idToken: string,
  ): Promise<IGetCurrentRefreshTokenDataMethodOutput> {
    return this.refreshTokenDataRepository.findOne({
      where: { userId, idToken },
    });
  }

  async insertOrUpdateRefreshTokenData(
    refreshTokenData: IRefreshTokenDataInDB,
  ): Promise<void> {
    const { userId, idToken } = refreshTokenData;
    const currentRefreshTokenData = await this.getCurrentRefreshTokenData(
      userId,
      idToken,
    );

    if (!currentRefreshTokenData) {
      await this.insertRefreshTokenData(refreshTokenData);
    } else {
      await this.updateRefreshTokenData(
        currentRefreshTokenData,
        refreshTokenData,
      );
    }
  }

  async createAccessTokenData({
    userId,
    email,
    role,
  }: ICreateAuthTokenData): Promise<IAccessTokenData> {
    const accessToken = await this.jwtService.signAsync(
      { userId, email, role },
      {
        algorithm: 'RS256',
        ...tmJwtSignOptions,
      },
    );
    const accessTokenExpiry = this.createTokenExpiry('access');
    return {
      accessToken,
      accessTokenExpiry,
    };
  }

  async createRefreshTokenData(
    userId: string,
    idToken: string,
  ): Promise<IRefreshTokenData> {
    const refreshToken = uuidv4();
    const refreshTokenExpiry = this.createTokenExpiry('refresh');
    await this.insertOrUpdateRefreshTokenData({
      refreshToken,
      refreshTokenExpiry,
      userId,
      isValid: true,
      idToken,
    });
    return {
      refreshToken,
      refreshTokenExpiry,
    };
  }

  /**
   * Check if there exists any Signed out idToken for the userId. If exists
   * return the Signed out idToken. If not return a new idToken.
   * @param {string} userId
   */
  private async getIdToken(userId: string): Promise<string> {
    const signedOutRefreshTokenData =
      await this.refreshTokenDataRepository.findOne({
        where: {
          userId,
          isSignedOut: true,
        },
      });

    const signedOutIdToken = R.view(
      R.lensProp('idToken'),
      signedOutRefreshTokenData,
    );
    if (!signedOutIdToken) {
      return uuidv4();
    }
    return signedOutIdToken;
  }

  async createAuthToken({
    userId,
    email,
    role,
  }: ICreateAuthTokenData): Promise<IAuthToken> {
    const accessTokenData = await this.createAccessTokenData({
      userId,
      email,
      role,
    });
    const idToken = await this.getIdToken(userId);
    const refreshTokenData = await this.createRefreshTokenData(userId, idToken);
    return {
      ...accessTokenData,
      ...refreshTokenData,
      idToken,
    };
  }

  private async defineUpdateAuthTokenStatus(
    userIdInReq: string,
    userIdInDb: string,
    idTokenInReq: string,
    idTokenInDb: string,
    refreshTokenInReq: string,
    refreshTokenInDb: string,
    refreshTokenExpiry: string,
    isValid: boolean,
    isSignedOut: boolean,
  ): Promise<IDefineUpdateAuthTokenStatusMethodOutput> {
    if (refreshTokenInReq !== refreshTokenInDb) {
      await this.invalidateRefreshToken(userIdInReq, idTokenInDb);
      return {
        status: UpdateAuthTokenResponseStatus.REFRESH_TOKEN_MISMATCH,
      };
    }

    if (!isValid) {
      return {
        status: UpdateAuthTokenResponseStatus.AUTH_TOKEN_UPDATE_INVALID,
      };
    }

    if (isSignedOut) {
      return {
        status: UpdateAuthTokenResponseStatus.USER_SIGNED_OUT,
      };
    }

    if (this.isRefreshTokenExpired(refreshTokenExpiry)) {
      return {
        status: UpdateAuthTokenResponseStatus.REFRESH_TOKEN_EXPIRED,
      };
    }

    return {
      status: UpdateAuthTokenResponseStatus.OK,
    };
  }

  private async getUserRole(userId: string): Promise<string> {
    const userData = await this.userService.getUserById(userId);

    return R.prop('role', userData);
  }

  async updateAuthToken(
    updateAuthTokenRequest: UpdateAuthTokenInput,
  ): Promise<UpdateAuthTokenResponseType> {
    const {
      userId: userIdInReq,
      email,
      refreshToken: refreshTokenInReq,
      idToken: idTokenInReq,
    } = updateAuthTokenRequest;
    if (!refreshTokenInReq) {
      throw new UnauthorizedException(
        this.getUpdateAuthTokenErrorMessage(
          UpdateAuthTokenResponseStatus.NO_REFRESH_TOKEN_IN_REQUEST,
        ),
      );
    }

    const currentRefreshTokenData = await this.getCurrentRefreshTokenData(
      userIdInReq,
      idTokenInReq,
    );
    if (!currentRefreshTokenData) {
      throw new UnauthorizedException(
        this.getUpdateAuthTokenErrorMessage(
          UpdateAuthTokenResponseStatus.NO_REFRESH_TOKEN_FOR_USER_IN_DB,
        ),
      );
    }

    const {
      userId: userIdInDb,
      refreshToken: refreshTokenInDb,
      refreshTokenExpiry,
      isValid,
      idToken: idTokenInDb,
      isSignedOut,
    } = currentRefreshTokenData;
    const updateAuthTokenStatus = await this.defineUpdateAuthTokenStatus(
      userIdInReq,
      userIdInDb,
      idTokenInReq,
      idTokenInDb,
      refreshTokenInReq,
      refreshTokenInDb,
      refreshTokenExpiry,
      isValid,
      isSignedOut,
    );
    if (updateAuthTokenStatus.status !== UpdateAuthTokenResponseStatus.OK) {
      throw new UnauthorizedException(
        this.getUpdateAuthTokenErrorMessage(updateAuthTokenStatus.status),
      );
    }

    const userRole = await this.getUserRole(userIdInReq);
    const accessTokenData = await this.createAccessTokenData({
      userId: userIdInReq,
      email,
      role: userRole,
    });
    const refreshTokenData = await this.createRefreshTokenData(
      userIdInDb,
      idTokenInReq,
    );

    const updatedAuthTokenData = R.mergeAll([
      accessTokenData,
      refreshTokenData,
      { idToken: idTokenInDb },
    ]);

    return {
      authTokenData: updatedAuthTokenData,
    };
  }

  /**
   * Validate a JSON Web Token.
   * @param validateJwtRequest {naas.auth.ValidateJwtRequest}
   */
  async validateJwt(jwt: string): Promise<IValidateJwtResponse> {
    try {
      const jwtResponse = await this.jwtService.verifyAsync(jwt, {
        algorithms: ['RS256'],
        ...tmJwtVerifyOptions,
      });
      if (jwtResponse === undefined) {
        return null;
      }
      return {
        userId: jwtResponse.userId,
        email: jwtResponse.email,
        role: jwtResponse.role,
      };
    } catch {
      return null;
    }
  }

  async insertRefreshTokenData(
    refreshTokenDataParam,
  ): Promise<RefreshTokenData> {
    const { refreshToken, refreshTokenExpiry, userId, idToken } =
      refreshTokenDataParam;
    const refreshTokenData: RefreshTokenData = new RefreshTokenData();
    refreshTokenData.refreshToken = refreshToken;
    refreshTokenData.refreshTokenExpiry = refreshTokenExpiry;
    refreshTokenData.userId = userId;
    refreshTokenData.idToken = idToken;
    await this.refreshTokenDataRepository.save(refreshTokenData);
    return refreshTokenData;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateRefreshTokenData(
    currentRefreshTokenDataParam,
    refreshTokenDataParam,
  ): Promise<RefreshTokenData> {
    const { refreshToken, refreshTokenExpiry, userId, isValid, idToken } =
      refreshTokenDataParam;

    const currentData = currentRefreshTokenDataParam;
    currentData.refreshToken = refreshToken;
    currentData.refreshTokenExpiry = refreshTokenExpiry;
    currentData.idToken = idToken;

    await this.refreshTokenDataRepository.update(
      { userId, idToken },
      {
        refreshToken,
        refreshTokenExpiry,
        isValid,
        idToken,
        isSignedOut: false,
      },
    );
    return currentData;
  }

  async invalidateRefreshToken(
    userId: string,
    idToken: string,
  ): Promise<UpdateResult> {
    return this.refreshTokenDataRepository.update(
      { userId, idToken },
      { isValid: false },
    );
  }
}
