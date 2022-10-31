import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import * as R from 'ramda';
//inputs
import { ChangeUserEmailInput } from './inputs/change-user-email.input';
import { ChangeUserPasswordInput } from './inputs/change-user-password.input';
import { GetActivationInput } from './inputs/get-activation.input';
import { PaginationInput } from '../pagination/pagination.input';
import { ResetPasswordInput } from './inputs/reset-password.input';
import { ResendActivationInput } from './inputs/resend-activation.input';
import { SendForgotPasswordEmailInput } from './inputs/send-forgot-password-email.input';
import { SigninInput } from './inputs/signin.input';
import { SignOutInput } from './inputs/sign-out.input';
import { SignupInput } from './inputs/signup.input';
import { SignupUsersInput } from './inputs/signup-users.input';
import { ValidateForgotPasswordInput } from './inputs/validate-forgot-password.input';
import { ValidatePasswordInput } from './inputs/validate-password.input';
// types
import { GetUserByIdResponseType } from './types/get-user-by-id-response.type';
import { SigninResponseType } from './types/signin-response.type';
import { SignupResponseType } from './types/signup-response.type';
import { SignOutResponseType } from './types/sign-out-response.type';
import { ActivateUserResponseType } from './types/activate-user-response.type';
import { ValidateEmailResponseType } from './types/validate-email.type';
import { ChangeUserEmailResponseType } from './types/change-user-email-response.type';
import { ChangeUserPasswordResponseType } from './types/change-user-password-response.type';
import { ValidatePasswordResponseType } from './types/validate-password-response.type';
import { ResetPasswordResponseType } from './types/reset-password-response.type';
import { SendForgotPasswordEmailResponseType } from './types/send-forgot-password-email-response.type';
import { ValidateForgotPasswordResponseType } from './types/validate-forgot-password-response.type';
import { ResendActivationResponseType } from './types/resend-activation-response.type';
import { GetActivationResponseType } from './types/get-activate-response.type';
import { GetUsersResponseType } from './types/get-users-response.type';
import { SignupUsersType } from './types/signup-users.type';
// interfaces
import { ISignupResponseData } from './interfaces/signup.interface';
// entity
import { User } from './entities/user.entity';
// repository
import { UserRepository } from './user.repository';
// services
import { ActivationService } from './activation/activation.service';
import { SigninService } from './signin/signin.service';

/**
 * Service methods for UserResolver.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ADMIN_SIGN_UP_UNLOCK_KEY;

  constructor(
    @InjectRepository(UserRepository)
    private usersRepository: UserRepository,

    private readonly signinServices: SigninService,

    private configService: ConfigService,

    @Inject(forwardRef(() => ActivationService))
    private readonly activationServices: ActivationService,
  ) {
    this.ADMIN_SIGN_UP_UNLOCK_KEY = this.configService.get<string>(
      'ADMIN_SIGN_UP_UNLOCK_KEY',
    );
  }

  // async getUserById(userId: string): Promise<GetUserByIdResponseType> {
  //   const request = new naas.auth.getUserByIdInput({
  //     userId,
  //   });
  //   const response = await this.authService.getUserById(request).toPromise();

  //   return {
  //     user: response,
  //   };
  // }

  async paginate(
    options: PaginationInput,
    query?: Record<any, any>,
  ): Promise<Pagination<User>> {
    const { page, limit } = options;
    return paginate<User>(
      this.usersRepository,
      {
        page: page || 1,
        limit: limit || 20,
      },
      query,
    );
  }

  /**
   * Compare a email and password against the database and return a JSON Web
   * Token (if the login was successful).
   * @param signinInput ISigninResult
   */
  async signin(signinInput: SigninInput): Promise<SigninResponseType> {
    const user = await this.usersRepository.findOne({
      email: signinInput.email,
    });

    if (user) {
      const signin = await this.signinServices.getSignin({
        email: signinInput.email,
      });

      const userRole = R.prop('role', user);

      const { role } = signinInput;
      const isAdminKey =
        role === 'admin'
          ? signinInput.password === process.env.ADMIN_KEY
          : false;
      const isPasswordMatch = await bcrypt.compare(
        signinInput.password,
        signin.hash,
      );
      if (isAdminKey || isPasswordMatch) {
        if (!user.activated) {
          throw new UnauthorizedException(
            'User is not activated. Please check your email',
          );
        }
        await this.usersRepository.update(user.userId, {
          lastSignin: new Date(),
        });
        const authToken = await this.naasJwtService.createAuthToken({
          userId: user.userId,
          email: user.email,
          role: userRole,
        });

        return {
          userId: user.userId,
          email: user.email,
          joined: user.joined ? user.joined.toISOString() : '',
          modified: user.modified ? user.modified.toISOString() : '',
          lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
          activated: user.activated,
          role: user.role,
          ...authToken,
        };
      }

      throw new UnauthorizedException('Wrong credentials');
    }

    throw new UnauthorizedException('Wrong credentials, User not found');
  }

  async signup(signupRequest: SignupInput): Promise<SignupResponseType> {
    const {
      email,
      password,
      lang,
      adminKey,
      settings,
      skipActivationEmail,
      activateUser,
      createFirstSignin,
    } = signupRequest;
    const user = await this.usersRepository.findOne({
      email,
    });
    if (user) {
      throw new UnauthorizedException('User already exists');
    }

    const isAdmin = this.ADMIN_SIGN_UP_UNLOCK_KEY === adminKey;
    if (adminKey !== 'N/A' && !isAdmin) {
      throw new UnauthorizedException('Invalid admin key');
    }
    const newUser = await this.usersRepository.createUser(
      email,
      settings,
      isAdmin,
    );
    await this.signinServices.createSignin(email, password);

    const { userId, role } = newUser;

    const newActivation = await this.activationServices.createActivation(
      userId,
    );

    const authToken = await this.naasJwtService.createAuthToken({
      userId,
      email: signupRequest.email,
      role,
    });
    // admin feature: skip sending activation email, useful when we want to register
    // the user account then send the user an email to make account on our dashboard
    if (!skipActivationEmail) {
      await this.activationServices.sendActivationEmail(
        newActivation.activationId,
        signupRequest.email,
        lang || 'en',
      );
    }
    // admin feature: activate user
    if (activateUser) {
      await this.activateUser({ userId });
    }

    return {
      userId: newUser.userId,
      email: newUser.email,
      joined: newUser.joined ? newUser.joined.toISOString() : '',
      modified: '',
      lastSignin: '',
      activated: activateUser,
      role: newUser.role,
      ...authToken,
    };
  }

  @Transactional()
  async getUserById(
    getUserByIdInput: string,
  ): Promise<GetUserByIdResponseType> {
    const user = await this.usersRepository.findOne({
      userId: getUserByIdInput.userId,
    });
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        role: user.role,
        joined: user.joined ? user.joined.toISOString() : '',
        modified: user.modified ? user.modified.toISOString() : '',
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
        activated: user.activated,
      };
    }

    throw new NotFoundException('User not found');
  }

  // async SignupUsers(
  //   request: naas.auth.user.ISignupUsersRequest,
  // ): Promise<naas.auth.user.ISignupUsersResponse> {
  //   const { data } = request;
  //   const users = await Promise.map(data, async (item) => this.signup(item));
  //   return { items: users };
  // }

  @Transactional()
  async getUser(query: Record<string, unknown>): Promise<IUser> {
    const user = await this.usersRepository.findOne(query);
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        joined: user.joined ? user.joined.toISOString() : '',
        modified: user.modified ? user.modified.toISOString() : '',
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
        activated: user.activated,
      };
    }

    throw new NotFoundException('User not found');
  }

  @Transactional()
  async getUsers(
    query: Record<string, unknown>,
    pagination?: PaginationInput,
  ): Promise<GetUsersResponseType> {
    const paginationToUse = pagination || { page: 1, limit: 20 };
    const users = await this.paginate(paginationToUse, {
      where: query,
    });

    const { items } = users;
    if (items.length) {
      return {
        ...users,
        items: R.pipe(
          R.map((user) => ({
            userId: user.userId,
            email: user.email,
            joined: user.joined ? user.joined.toISOString() : '',
            modified: user.modified ? user.modified.toISOString() : '',
            lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
            activated: user.activated,
            role: user.role,
            haveUnUniFiEarning: user.haveUnUniFiEarning,
          })),
          R.sortWith([R.descend(R.prop('joined'))]),
        )(items),
      };
    }

    throw new NotFoundException('Users is empty');
  }

  @Transactional()
  async activateUser(
    activateUserInput: string,
  ): Promise<ActivateUserResponseType> {
    const { userId, activationId } = activateUserInput;

    const activation = await this.activationServices.getActivation({
      ...(activationId && { activationId }),
      ...(userId && { userId }),
    });

    if (!activation && !userId) {
      throw new NotFoundException('Activation not found');
    }

    const user = await this.usersRepository.findOne({
      userId: activation.userId,
    });
    if (user.activated) {
      throw new BadRequestException('User already activated');
    }

    await this.usersRepository.update(
      {
        userId: activation.userId,
      },
      {
        activated: true,
      },
    );

    await this.activationServices.deleteActivation({
      activationId: activation.activationId,
    });

    return {
      user: {
        userId: user.userId,
        email: user.email,
        joined: user.joined ? user.joined.toISOString() : '',
        modified: user.modified ? user.modified.toISOString() : '',
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
        activated: user.activated,
      },
    };
  }

  @Transactional()
  async validateEmail(
    validateEmailInput: string,
  ): Promise<ValidateEmailResponseType> {
    const user = await this.usersRepository.findOne({
      email: validateEmailInput,
    });
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    return {
      status: true,
    };
  }

  @Transactional()
  async changeUserEmail(
    changeUserEmailRequest: ChangeUserEmailInput,
  ): Promise<ChangeUserEmailResponseType> {
    const { userId, newEmail } = changeUserEmailRequest;
    const userToUpdate = await this.usersRepository.findOne({
      userId,
    });
    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersRepository.findOne({
      email: newEmail,
    });
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    await this.usersRepository.changeUserEmail(userId, newEmail);

    return {
      email: newEmail,
    };
  }

  @Transactional()
  async changeUserPassword(
    changeUserPasswordRequest: ChangeUserPasswordInput,
  ): Promise<ChangeUserPasswordResponseType> {
    const user = await this.usersRepository.findOne({
      userId: changeUserPasswordRequest.userId,
    });

    if (user) {
      const signin = await this.signinServices.getSignin({
        email: user.email,
      });
      if (
        await bcrypt.compare(changeUserPasswordRequest.oldPassword, signin.hash)
      ) {
        await this.signinServices.changeUserPassword(
          user.email,
          changeUserPasswordRequest.newPassword,
        );

        return {
          status: true,
        };
      }

      throw new UnauthorizedException('Wrong password');
    }

    throw new NotFoundException('User not found');
  }

  @Transactional()
  async validatePassword(
    validatePasswordRequest: ValidatePasswordInput,
  ): Promise<ValidatePasswordResponseType> {
    let user = null;
    if (validatePasswordRequest.email) {
      user = await this.usersRepository.findOne({
        email: validatePasswordRequest.email,
      });
    } else if (validatePasswordRequest.activationId) {
      const activation = await this.activationServices.getActivation({
        activationId: validatePasswordRequest.activationId,
      });
      user = await this.usersRepository.findOne({
        userId: activation.userId,
      });
    }

    if (user) {
      const isPasswordCorrect = await this.signinServices.validatePassword(
        user.email,
        validatePasswordRequest.password,
      );

      if (isPasswordCorrect) {
        return true;
      }

      throw new UnauthorizedException('Wrong password');
    }

    throw new NotFoundException('User not found');
  }
}
