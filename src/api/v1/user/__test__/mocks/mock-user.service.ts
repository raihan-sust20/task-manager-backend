import {
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as R from 'ramda';
import { naas } from '../../../proto/proto';
// types
import { GetUserByIdResponseType } from '../../types/get-user-by-id-response.type';
import { SigninResponseType } from '../../types/signin-response.type';
import { SigninInput } from '../../inputs/signin.input';
import { SignupInput } from '../../inputs/signup.input';
import { SignupResponseType } from '../../types/signup-response.type';
import { SignOutInput } from '../../inputs/sign-out.input';
import { SignOutResponseType } from '../../types/sign-out-response.type';
import { ActivateUserResponseType } from '../../types/activate-user-response.type';
import { ValidateEmailResponseType } from '../../types/validate-email.type';
import { AuthService } from '../../auth/auth.interface';
import { ChangeUserEmailResponseType } from '../../types/change-user-email-response.type';
import { ChangeUserEmailInput } from '../../inputs/change-user-email.input';
import { ChangeUserPasswordInput } from '../../inputs/change-user-password.input';
import { ChangeUserPasswordResponseType } from '../../types/change-user-password-response.type';
import { ValidatePasswordInput } from '../../inputs/validate-password.input';
import { ValidatePasswordResponseType } from '../../types/validate-password-response.type';
import { ResetPasswordInput } from '../../inputs/reset-password.input';
import { SendForgotPasswordEmailInput } from '../../inputs/send-forgot-password-email.input';
import { ResetPasswordResponseType } from '../../types/reset-password-response.type';
import { SendForgotPasswordEmailResponseType } from '../../types/send-forgot-password-email-response.type';
import { ValidateForgotPasswordInput } from '../../inputs/validate-forgot-password.input';
import { ValidateForgotPasswordResponseType } from '../../types/validate-forgot-password-response.type';
import { ResendActivationInput } from '../../inputs/resend-activation.input';
import { ResendActivationResponseType } from '../../types/resend-activation-response.type';
import { GetActivationInput } from '../../inputs/get-activation.input';
import { GetActivationResponseType } from '../../types/get-activate-response.type';
import { GetUsersResponseType } from '../../types/get-users-response.type';
import { PaginationInput } from '../../../pagination/pagination.input';
import { SignupUsersInput } from '../../inputs/signup-users.input';
import { SignupUsersType } from '../../types/signup-users.type';
/**
 * Service methods for UserResolver.
 */
@Injectable()
export class MockUserService implements OnModuleInit {
  private authService: AuthService;

  constructor(
    @Inject('AUTH_SERVICE_GRPC')
    private grpcClient: ClientGrpc
  ) {}

  onModuleInit(): void {
    this.authService = this.grpcClient.getService<AuthService>('AuthService');
  }

  async getUserById(userId: string): Promise<GetUserByIdResponseType> {
    const request = new naas.auth.GetUserByIdRequest({
      userId
    });
    const response = await this.authService.getUserById(request).toPromise();

    return {
      user: response
    };
  }

  async getUsers(
    paginationInput?: PaginationInput,
    query?: Record<string, unknown>,
  ): Promise<GetUsersResponseType> {
    const request = new naas.auth.user.GetUsersRequest({
      query: JSON.stringify(query),
      pagination: paginationInput,
    });
    const response = await this.authService.getUsers(request).toPromise();
    return {
      ...response
    };
  }

  async signin(
    signinInput: SigninInput,
  ): Promise<SigninResponseType> {
    const request = new naas.auth.SigninRequest({
      email: signinInput.email,
      password: signinInput.password,
      role: signinInput.role,
    });

    const response = await this.authService.signin(request).toPromise();

    const {
      userId,
      email,
      joined,
      modified,
      lastSignin,
      activated,
      role,
      accessToken,
      accessTokenExpiry,
      refreshToken,
      refreshTokenExpiry,
      idToken,
    } = response;

    return {
      user: {
        userId,
        email,
        joined,
        modified,
        lastSignin,
        activated,
        role,
      },
      authTokenData: {
        accessToken,
        accessTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
        idToken,
      }
    };
  }

  // eslint-disable-next-line class-methods-use-this
  formatSignupResponse = (response) => {
    const {
      userId,
      email,
      joined,
      modified,
      lastSignin,
      activated,
      role,
      accessToken,
      accessTokenExpiry,
      refreshToken,
      refreshTokenExpiry,
      idToken,
      firstSignin,
    } = response;

    return {
      user: {
        userId,
        email,
        joined,
        modified,
        lastSignin,
        activated,
        role,
      },
      firstSignin,
      authTokenData: {
        accessToken,
        accessTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
        idToken,
      }
    };
  }

  async signup(signupInput: SignupInput): Promise<SignupResponseType> {
    const request = new naas.auth.user.SignupRequest({
      ...signupInput
    });
    const response = await this.authService.signup(request).toPromise();
    return this.formatSignupResponse(response);
  }

  async signupUsers(
    signupUsersInput: SignupUsersInput
  ): Promise<SignupUsersType> {
    const request = new naas.auth.user.SignupUsersRequest({
      ...signupUsersInput
    });
    const response = await this.authService.signupUsers(request).toPromise();

    const { items } = response;
    return {
      items: R.map(this.formatSignupResponse, items)
    };
  }

  async signOut(signOutInput: SignOutInput): Promise<SignOutResponseType> {
    const request = new naas.auth.user.SignOutRequest({
      ...signOutInput,
    });
    const response = await this.authService.signOut(request).toPromise();
    return response;
  }

  async activateUser(activationId: string): Promise<ActivateUserResponseType> {
    const request = new naas.auth.ActivateUserRequest({
      activationId
    });
    const response = await this.authService.activateUser(request).toPromise();

    return {
      status: true,
      user: response.user
    };
  }

  async validateEmail(email: string): Promise<ValidateEmailResponseType> {
    const request = new naas.auth.ValidateEmailRequest({
      email
    });
    const response = await this.authService.validateEmail(request).toPromise();

    const { ValidateEmailResponseStatus } = naas.auth.ValidateEmailResponse;
    if (response.status !== ValidateEmailResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true
    };
  }

  async changeUserEmail(
    changeUserEmailInput: ChangeUserEmailInput
  ): Promise<ChangeUserEmailResponseType> {
    const request = new naas.auth.ChangeUserEmailRequest(changeUserEmailInput);
    const response = await this.authService.changeUserEmail(request).toPromise();

    return {
      email: response.email
    };
  }

  async changeUserPassword(
    changeUserPasswordInput: ChangeUserPasswordInput
  ): Promise<ChangeUserPasswordResponseType> {
    const request = new naas.auth.ChangeUserPasswordRequest(changeUserPasswordInput);
    const response = await this.authService.changeUserPassword(request).toPromise();

    const { ChangeUserPasswordResponseStatus } = naas.auth.ChangeUserPasswordResponse;
    if (response.status !== ChangeUserPasswordResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true
    };
  }

  async validatePassword(
    validatePasswordInput: ValidatePasswordInput
  ): Promise<ValidatePasswordResponseType> {
    const request = new naas.auth.ValidatePasswordRequest(validatePasswordInput);
    const response = await this.authService.validatePassword(request).toPromise();

    const { ValidatePasswordResponseStatus } = naas.auth.ValidatePasswordResponse;
    if (response.status !== ValidatePasswordResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true,
    };
  }

  async sendForgotPasswordEmail(
    sendForgotPasswordEmailInput: SendForgotPasswordEmailInput
  ): Promise<SendForgotPasswordEmailResponseType> {
    const request = new naas.auth.SendForgotPasswordEmailRequest(sendForgotPasswordEmailInput);
    const response = await this.authService.sendForgotPasswordEmail(request).toPromise();

    const { SendForgotPasswordEmailResponseStatus } = naas.auth.SendForgotPasswordEmailResponse;
    if (response.status !== SendForgotPasswordEmailResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true
    };
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordInput
  ): Promise<ResetPasswordResponseType> {
    const request = new naas.auth.ResetPasswordRequest(resetPasswordInput);
    const response = await this.authService.resetPassword(request).toPromise();

    const { ResetPasswordResponseStatus } = naas.auth.ResetPasswordResponse;
    if (response.status !== ResetPasswordResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true
    };
  }

  async validateForgotPassword(
    validateForgotPasswordInput: ValidateForgotPasswordInput
  ): Promise<ValidateForgotPasswordResponseType> {
    const request = new naas.auth.ValidateForgotPasswordRequest(validateForgotPasswordInput);
    const response = await this.authService.validateForgotPassword(request).toPromise();

    const { ValidateForgotPasswordResponseStatus } = naas.auth.ValidateForgotPasswordResponse;
    if (response.status !== ValidateForgotPasswordResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true
    };
  }

  async resendActivation(
    resendActivationInput: ResendActivationInput
  ): Promise<ResendActivationResponseType> {
    const request = new naas.auth.ResendActivationRequest(resendActivationInput);
    const response = await this.authService.resendActivation(request).toPromise();

    const { ResendActivationResponseStatus } = naas.auth.ResendActivationResponse;
    if (response.status !== ResendActivationResponseStatus.OK) {
      return {
        status: false
      };
    }

    return {
      status: true
    };
  }

  async getActivation(
    getActivationInput: GetActivationInput
  ): Promise<GetActivationResponseType> {
    const request = new naas.auth.GetActivationRequest(getActivationInput);
    const response = await this.authService.getActivation(request).toPromise();

    return response;
  }

  async validatePromotionCode(
    promotionCode: string
  ) {
    const request = new naas.auth.stripe.ValidatePromotionCodeRequest({ promotionCode });
    return this.authService.validatePromotionCode(request).toPromise();
  }
}
