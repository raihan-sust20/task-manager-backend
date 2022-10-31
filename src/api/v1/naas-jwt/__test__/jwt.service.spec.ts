// eslint-disable-next-line import/no-extraneous-dependencies
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '../naas-jwt.service';
import { naas } from '../../../proto/proto';
import { MockAuthModule } from '../../../mocks/mock-auth/mock-auth.module';
import { MockJwtService } from '../__mocks__/mock-jwt.service';
import {
  getUpdateAuthTokenErrorMessageNoRefreshTokenOutput,
  getUpdateAuthTokenErrorMessagerefreshTokenMismatchOutput,
  getUpdateAuthTokenErrorMessageNoRefreshForUserOutput,
  getUpdateAuthTokenErrorMessageAuthTokenUpdateInvalidOutput,
  getUpdateAuthTokenErrorMessageRefreshTokenExpiredOutput,
  getUpdateAuthTokenErrorMessageUserSignedOut,
  getUpdateAuthTokenErrorMessageDefaultOutput,
  updateAuthTokenInput,
  updateAuthTokenErrorInput,
  updateAuthTokenOutput,
} from './jwt.service.spec.constants';
import { mockKey, mockEmail } from '../../../mocks/mock-values.constants';

describe('JwtService', () => {
  /**
   * In {@link MockJwtService} just a private method is made public for unit testing.
   */
  let jwtService: MockJwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        /**
         * Since {@link V1Module} (that actually prepare {@link ConfigModule} with forRoot method)
         *  is not being used in unit testing, prepare the {@link ConfigModule} here.
         */
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MockAuthModule,
      ],
      providers: [JwtService],
    })
      .overrideProvider(JwtService)
      .useClass(MockJwtService)
      .compile();

    jwtService = module.get<JwtService, MockJwtService>(JwtService);
    jwtService.onModuleInit();
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('getUpdateAuthTokenErrorMessage', () => {
    const { UpdateAuthTokenResponseStatus } = naas.auth.UpdateAuthTokenResponse;
    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(
        UpdateAuthTokenResponseStatus.NO_REFRESH_TOKEN_IN_REQUEST,
      );
      expect(output).toBe(getUpdateAuthTokenErrorMessageNoRefreshTokenOutput);
    });

    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(
        UpdateAuthTokenResponseStatus.REFRESH_TOKEN_MISMATCH,
      );
      expect(output).toBe(
        getUpdateAuthTokenErrorMessagerefreshTokenMismatchOutput,
      );
    });

    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(
        UpdateAuthTokenResponseStatus.NO_REFRESH_TOKEN_FOR_USER_IN_DB,
      );
      expect(output).toBe(getUpdateAuthTokenErrorMessageNoRefreshForUserOutput);
    });
    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(
        UpdateAuthTokenResponseStatus.AUTH_TOKEN_UPDATE_INVALID,
      );
      expect(output).toBe(
        getUpdateAuthTokenErrorMessageAuthTokenUpdateInvalidOutput,
      );
    });

    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(
        UpdateAuthTokenResponseStatus.REFRESH_TOKEN_EXPIRED,
      );
      expect(output).toBe(
        getUpdateAuthTokenErrorMessageRefreshTokenExpiredOutput,
      );
    });

    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(
        UpdateAuthTokenResponseStatus.USER_SIGNED_OUT,
      );
      expect(output).toBe(getUpdateAuthTokenErrorMessageUserSignedOut);
    });

    it('should return jwt response data', () => {
      const output = jwtService.getUpdateAuthTokenErrorMessage(7);
      expect(output).toBe(getUpdateAuthTokenErrorMessageDefaultOutput);
    });
  });

  /**
   * @todo Unit tests for remaining update auth token response stauts
   */
  describe('updateAuthToken', () => {
    it('should return updated auth token data', async () => {
      const output = await jwtService.updateAuthToken(updateAuthTokenInput);
      expect(output).toStrictEqual(updateAuthTokenOutput);
    });

    it('should throw UnauthorizedException for no refresh token in request', async () => {
      await expect(
        jwtService.updateAuthToken(updateAuthTokenErrorInput),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateJwt', () => {
    it('should return user email', async () => {
      const output = await jwtService.validateJwt(mockKey);
      expect(output).toStrictEqual(mockEmail);
    });

    it('should return null due to invalid jwt', async () => {
      const output = await jwtService.validateJwt(`MalformedJwt${mockKey}`);
      expect(output).toStrictEqual(null);
    });

    it('should return null due to malformed jwt', async () => {
      const output = await jwtService.validateJwt(`NotValid${mockKey}`);
      expect(output).toStrictEqual(null);
    });
  });
});
