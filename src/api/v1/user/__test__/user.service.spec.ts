// eslint-disable-next-line import/no-extraneous-dependencies
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { MockAuthModule } from '../../mocks/mock-auth/mock-auth.module';
import { MockUserService } from './mocks/mock-user.service';
import {
  mockId,
} from '../../mocks/mock-values.constants';
import {
  getUserByIdOutput,
  signupInput,
  signupOutput,
  signinInput,
  signinOutput,
  formatSignupResponseInput,
  formatSignupResponseOutput,
  getUsersQuery,
  paginationInput,
  getUsersOutput,
  signupUsersInput,
  signupUsersOutput,
  signOutInput,
  signOutOutput,
  activateUserInput,
  activateUserOutput,
  validateEmailInput,
  validateEmailOutput,
  changeUserEmailInput,
  changeUserEmailOutput,
  changeUserPasswordInput,
  changeUserPasswordOutput,
  validatePasswordInput,
  validatePasswordOutput,
  sendForgotPasswordEmailInput,
  sendForgotPasswordEmailOutput,
  resetPasswordInput,
  resetPasswordOutput,
  validateForgotPasswordInput,
  validateForgotPasswordOutput,
  resendActivationInput,
  resendActivationOutput,
  getActivationInput,
  getActivationOutput,
  validatePromotionCodeInput,
  validatePromotionCodeOutput,
} from './user.service.spec.constants';

describe('UserService', () => {
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      providers: [UserService],
    })
      // In MockUserService all 'private' methods are made 'public' methods for
      // unit testing
      .overrideProvider(UserService)
      .useClass(MockUserService)
      .compile();

    userService = await module.get<UserService, MockUserService>(UserService);
    userService.onModuleInit();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return a user data', async () => {
      const output = await userService.getUserById(mockId);
      expect(output).toStrictEqual(getUserByIdOutput);
    });
  });

  describe('signin', () => {
    it('should return a signin response', async () => {
      const output = await userService.signin(signinInput);
      expect(output).toStrictEqual(signinOutput);
    });
  });

  describe('signup', () => {
    it('should return a signup response', async () => {
      const output = await userService.signup(signupInput);
      expect(output).toStrictEqual(signupOutput);
    });
  });

  describe('formatSignupResponse', () => {
    it('should return a formatted signup response', async () => {
      const output = await userService.formatSignupResponse(formatSignupResponseInput);
      expect(output).toStrictEqual(formatSignupResponseOutput);
    });
  });

  describe('getUsers', () => {
    it('should return users data', async () => {
      const output = await userService.getUsers(paginationInput, getUsersQuery);
      expect(output).toStrictEqual(getUsersOutput);
    });
  });

  describe('signupUsers', () => {
    it('should return signup users response', async () => {
      const output = await userService.signupUsers(signupUsersInput);
      expect(output).toStrictEqual(signupUsersOutput);
    });
  });

  describe('signOut', () => {
    it('should return sign out response', async () => {
      const output = await userService.signOut(signOutInput);
      expect(output).toStrictEqual(signOutOutput);
    });
  });

  describe('activateUser', () => {
    it('should return activate user response', async () => {
      const output = await userService.activateUser(activateUserInput);
      expect(output).toStrictEqual(activateUserOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('validateEmail', () => {
    it('should return validate email successfully', async () => {
      const output = await userService.validateEmail(validateEmailInput);
      expect(output).toStrictEqual(validateEmailOutput);
    });
  });

  describe('changeUserEmail', () => {
    it('should return new user email', async () => {
      const output = await userService.changeUserEmail(changeUserEmailInput);
      expect(output).toStrictEqual(changeUserEmailOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('changeUserPassword', () => {
    it('should change user password successfully', async () => {
      const output = await userService.changeUserPassword(changeUserPasswordInput);
      expect(output).toStrictEqual(changeUserPasswordOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('validatePassword', () => {
    it('should validate password successfully', async () => {
      const output = await userService.validatePassword(validatePasswordInput);
      expect(output).toStrictEqual(validatePasswordOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('sendForgotPasswordEmail', () => {
    it('should send forgot password email successfully', async () => {
      const output = await userService.sendForgotPasswordEmail(sendForgotPasswordEmailInput);
      expect(output).toStrictEqual(sendForgotPasswordEmailOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const output = await userService.resetPassword(resetPasswordInput);
      expect(output).toStrictEqual(resetPasswordOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('validateForgotPassword', () => {
    it('should validate forgot password successfully', async () => {
      const output = await userService.validateForgotPassword(validateForgotPasswordInput);
      expect(output).toStrictEqual(validateForgotPasswordOutput);
    });
  });

  /**
   * @todo Need to write test other status returned from AS
   */
  describe('resendActivation', () => {
    it('should resend activation email successfully', async () => {
      const output = await userService.resendActivation(resendActivationInput);
      expect(output).toStrictEqual(resendActivationOutput);
    });
  });

  describe('getActivation', () => {
    it('should get activation id', async () => {
      const output = await userService.getActivation(getActivationInput);
      expect(output).toStrictEqual(getActivationOutput);
    });
  });

  describe('validatePromotionCode', () => {
    it('should validate promotion code successfully', async () => {
      const output = await userService.validatePromotionCode(validatePromotionCodeInput);
      expect(output).toStrictEqual(validatePromotionCodeOutput);
    });
  });
});
