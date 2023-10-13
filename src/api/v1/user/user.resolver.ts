import * as R from 'ramda';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import {
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { NaasExceptionFilter } from '../exception-filter/exception.filter';

import { SigninInput } from './inputs/signin.input';
import { GetUserByIdInput } from './inputs/get-user-by-id.input';
import { ActivateUserInput } from './inputs/activate-user.input';
import { ValidateEmailInput } from './inputs/validate-email.input';
import { ChangeUserEmailInput } from './inputs/change-user-email.input';
import { ChangeUserPasswordInput } from './inputs/change-user-password.input';
import { ValidatePasswordInput } from './inputs/validate-password.input';
// import { UpdateAuthTokenInput } from './inputs/update-auth-token.input';
import { SendForgotPasswordEmailInput } from './inputs/send-forgot-password-email.input';
import { ResetPasswordInput } from './inputs/reset-password.input';
import { ValidateForgotPasswordInput } from './inputs/validate-forgot-password.input';
import { ResendActivationInput } from './inputs/resend-activation.input';
import { GetActivationInput } from './inputs/get-activation.input';
import { SignupInput } from './inputs/signup.input';
import { GetUsersInput } from './inputs/get-users.input';
import { PaginationInput } from '../pagination/pagination.input';
// types
import { SigninResponseType } from './types/signin-response.type';
import { SignupResponseType } from './types/signup-response.type';
import { SignOutResponseType } from './types/sign-out-response.type';
import { GetUserByIdResponseType } from './types/get-user-by-id-response.type';
import { ActivateUserResponseType } from './types/activate-user-response.type';
// import { UpdateAuthTokenResponseType } from './types/update-auth-token-response.type';
import { ValidateEmailResponseType } from './types/validate-email.type';
import { ChangeUserEmailResponseType } from './types/change-user-email-response.type';
import { ChangeUserPasswordResponseType } from './types/change-user-password-response.type';
import { ValidatePasswordResponseType } from './types/validate-password-response.type';
import { SendForgotPasswordEmailResponseType } from './types/send-forgot-password-email-response.type';
import { ResetPasswordResponseType } from './types/reset-password-response.type';
import { ValidateForgotPasswordResponseType } from './types/validate-forgot-password-response.type';
import { ResendActivationResponseType } from './types/resend-activation-response.type';
import { GetActivationResponseType } from './types/get-activate-response.type';
import { GetUsersResponseType } from './types/get-users-response.type';
// decorators
import { Roles } from '../authz/roles.decorator';
// others
import { TmJwtGuard } from '../tm-jwt/tm-jwt.guard';

/**
 * GraphQL resolver for IUsers.
 */
@Resolver((of) => SigninResponseType)
@UseFilters(NaasExceptionFilter)
export class UserResolver {
  private defaultUser: string;

  constructor(
    private userService: UserService,
  ) {
    this.defaultUser = 'User';
  }

  /**
   * Log into an User.
   */
  @Mutation(() => SigninResponseType)
  async signin(
    @Args('signinInput')
    signinInput: SigninInput,
  ): Promise<SigninResponseType> {
    const signinResponse = await this.userService.signin(signinInput);
    return signinResponse;
  }

  /**
   * Create an user
   */
  @Mutation(() => SignupResponseType)
  async signup(
    @Args('signupInput')
    signupInput: SignupInput,
  ): Promise<SignupResponseType> {
    const signupResponse = await this.userService.signup(signupInput);
    return signupResponse;
  }

  /**
   * Get user by id
   */
  @Query(() => GetUserByIdResponseType)
  @UseGuards(TmJwtGuard)
  async getUserById(
    @Args('getUserByIdInput') getUserByIdInput: GetUserByIdInput,
  ): Promise<GetUserByIdResponseType> {
    const { userId } = getUserByIdInput;
    const response = await this.userService.getUserById(userId);
    return response;
  }

  @Query(() => GetUsersResponseType)
  @UseGuards(TmJwtGuard)
  @Roles(['ADMIN'])
  async getUsers(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('getUsersInput', { nullable: true }) getUsersInput: GetUsersInput,
  ): Promise<GetUsersResponseType> {
    const query = R.prop('query', getUsersInput);
    const queryToUse = query || {};
    const response = await this.userService.getUsers(
      queryToUse,
      paginationInput      
    );
    return response;
  }

  /**
   * Activate user
   */
  @Mutation(() => ActivateUserResponseType)
  async activateUser(
    @Args('activateUserInput') activateUserInput: ActivateUserInput,
  ): Promise<ActivateUserResponseType> {
    const { activationId } = activateUserInput;
    const response = await this.userService.activateUser(activationId);
    return response;
  }

  /**
   * Validate email
   */
  @Mutation(() => ValidateEmailResponseType)
  async validateEmail(
    @Args('validateEmailInput') validateEmailInput: ValidateEmailInput,
  ): Promise<ValidateEmailResponseType> {
    const { email } = validateEmailInput;
    const response = await this.userService.validateEmail(email);
    return response;
  }

  /**
   * Change user email
   */
  @Mutation(() => ChangeUserEmailResponseType)
  @UseGuards(TmJwtGuard)
  async changeUserEmail(
    @Args('changeUserEmailInput') changeUserEmailInput: ChangeUserEmailInput,
  ): Promise<ChangeUserEmailResponseType> {
    const response = await this.userService.changeUserEmail(
      changeUserEmailInput,
    );
    return response;
  }

  /**
   * Change user password
   */
  @Mutation(() => ChangeUserPasswordResponseType)
  @UseGuards(TmJwtGuard)
  async changeUserPassword(
    @Args('changeUserPasswordInput')
    changeUserPasswordInput: ChangeUserPasswordInput,
  ): Promise<ChangeUserPasswordResponseType> {
    const response = await this.userService.changeUserPassword(
      changeUserPasswordInput,
    );
    return response;
  }

  /**
   * Validate user password
   */
  @Mutation(() => ValidatePasswordResponseType)
  async validatePassword(
    @Args('validatePasswordInput') validatePasswordInput: ValidatePasswordInput,
  ): Promise<ValidatePasswordResponseType> {
    const response = await this.userService.validatePassword(
      validatePasswordInput,
    );
    return response;
  }

  // /**
  //  * Send forgot password email
  //  */
  // @Mutation(() => SendForgotPasswordEmailResponseType)
  // async sendForgotPasswordEmail(
  //   @Args('sendForgotPasswordEmailInput')
  //   sendForgotPasswordEmailInput: SendForgotPasswordEmailInput,
  // ): Promise<SendForgotPasswordEmailResponseType> {
  //   const response = await this.userService.sendForgotPasswordEmail(
  //     sendForgotPasswordEmailInput,
  //   );
  //   return response;
  // }

  // /**
  //  * Validate user password
  //  */
  // @Mutation(() => ResetPasswordResponseType)
  // async resetPassword(
  //   @Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput,
  // ): Promise<ResetPasswordResponseType> {
  //   const response = await this.userService.resetPassword(resetPasswordInput);
  //   return response;
  // }

  // /**
  //  * Validate forgot password
  //  */
  // @Mutation(() => ValidateForgotPasswordResponseType)
  // async validateForgotPassword(
  //   @Args('validateForgotPasswordInput')
  //   validateForgotPasswordInput: ValidateForgotPasswordInput,
  // ): Promise<ValidateForgotPasswordResponseType> {
  //   const response = await this.userService.validateForgotPassword(
  //     validateForgotPasswordInput,
  //   );
  //   return response;
  // }

  // /**
  //  * Resend activation email
  //  */
  // @Mutation(() => ResendActivationResponseType)
  // async resendActivation(
  //   @Args('resendActivationInput') resendActivationInput: ResendActivationInput,
  // ): Promise<ResendActivationResponseType> {
  //   const response = await this.userService.resendActivation(
  //     resendActivationInput,
  //   );
  //   return response;
  // }

  // /**
  //  * Update Auth Token
  //  */
  // @Mutation(() => UpdateAuthTokenResponseType)
  // async updateAuthToken(
  //   @Args('updateAuthTokenInput')
  //   updateAuthTokenInput: UpdateAuthTokenInput,
  // ): Promise<UpdateAuthTokenResponseType> {
  //   const updateAuthTokenResponse = await this.jwtService.updateAuthToken(
  //     updateAuthTokenInput,
  //   );
  //   return updateAuthTokenResponse;
  // }

  // /**
  //  * Get activation
  //  */
  // @Query(() => GetActivationResponseType)
  // async getActivation(
  //   @Args('getActivationInput') getActivationInput: GetActivationInput,
  // ): Promise<GetActivationResponseType> {
  //   const response = await this.userService.getActivation(getActivationInput);
  //   return response;
  // }
}
