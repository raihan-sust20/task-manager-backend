import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import * as R from 'ramda';
import { Repository } from 'typeorm';
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
// interfaces
import { ISignupResponseData } from './interfaces/signup.interface';
// entity
import { User, UserRole } from './entities/user.entity';
// services
import { ActivationService } from './activation/activation.service';
import { SigninService } from './signin/signin.service';
import { IUser } from './interfaces/user.interface';
import { TmJwtService } from '../tm-jwt/tm-jwt.service';

/**
 * Service methods for UserResolver.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ADMIN_SIGN_UP_UNLOCK_KEY;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly signinServices: SigninService,

    private readonly tmJwtService: TmJwtService,

    private configService: ConfigService,

    @Inject(forwardRef(() => ActivationService))
    private readonly activationServices: ActivationService,
  ) {
    this.ADMIN_SIGN_UP_UNLOCK_KEY = this.configService.get<string>(
      'ADMIN_SIGN_UP_UNLOCK_KEY',
    );
  }

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
   * @param signinInput
   */
  async signin(signinInput: SigninInput): Promise<SigninResponseType> {
    const user = await this.usersRepository.findOne({
      where: {
        email: signinInput.email,
      },
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
          lastSignin: new Date().toISOString(),
        });
        const authToken = await this.tmJwtService.createAuthToken({
          userId: user.userId,
          email: user.email,
          role: userRole,
        });

        return {
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            division: user.division,
            designation: user.designation,
            joined: user.joined ? user.joined.toISOString() : '',
            lastModified: user.lastModified
              ? user.lastModified.toISOString()
              : '',
            lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
            activated: user.activated,
            role: user.role,
          },
          authTokenData: {
            ...authToken,
          },
        };
      }

      throw new UnauthorizedException('Wrong credentials');
    }

    throw new UnauthorizedException('Wrong credentials, User not found');
  }

  async createUser(signupInput: SignupInput, isAdmin: boolean): Promise<User> {
    const { email, name, division, designation } = signupInput;
    const newUser = new User();
    newUser.email = email;
    newUser.name = name;
    newUser.division = division;
    newUser.designation = designation;
    newUser.joined = new Date();
    if (isAdmin) {
      newUser.role = UserRole.ADMIN;
    }
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async signup(signupInput: SignupInput): Promise<SignupResponseType> {
    const { email, name, division, designation, password, adminKey } =
      signupInput;
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    if (user) {
      throw new UnauthorizedException('User already exists');
    }

    const isAdmin = this.ADMIN_SIGN_UP_UNLOCK_KEY === adminKey;
    if (adminKey !== 'N/A' && !isAdmin) {
      throw new UnauthorizedException('Invalid admin key');
    }
    const newUser = await this.createUser(signupInput, isAdmin);
    await this.signinServices.createSignin(email, password);

    const { userId, role } = newUser;

    const newActivation = await this.activationServices.createActivation(
      userId,
    );

    const authToken = await this.tmJwtService.createAuthToken({
      userId,
      email: signupInput.email,
      role,
    });

    return {
      user: {
        userId: newUser.userId,
        email: newUser.email,
        name: user.name,
        division: user.division,
        designation: user.designation,
        joined: newUser.joined ? newUser.joined.toISOString() : '',
        lastModified: '',
        lastSignin: '',
        role: newUser.role,
      },
      authTokenData: {
        ...authToken,
      },
    };
  }

  async getUserById(userId: string): Promise<GetUserByIdResponseType> {
    const user = await this.usersRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (user) {
      return {
        user: {
          userId,
          email: user.email,
          name: user.name,
          division: user.division,
          designation: user.designation,
          role: user.role,
          joined: user.joined ? user.joined.toISOString() : '',
          lastModified: user.lastModified
            ? user.lastModified.toISOString()
            : '',
          lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
          activated: user.activated,
        },
      };
    }

    throw new NotFoundException('User not found');
  }

  async getUser(query: Record<string, unknown>): Promise<IUser> {
    const user = await this.usersRepository.findOne({ where: query });
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        division: user.division,
        designation: user.designation,
        joined: user.joined ? user.joined.toISOString() : '',
        lastModified: user.lastModified ? user.lastModified.toISOString() : '',
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
        activated: user.activated,
      };
    }

    throw new NotFoundException('User not found');
  }

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
          R.map((user: Record<string, any>) => ({
            userId: user.userId,
            email: user.email,
            name: user.name,
            division: user.division,
            designation: user.designation,
            joined: user.joined ? user.joined.toISOString() : '',
            lastModified: user.lastModified
              ? user.lastModified.toISOString()
              : '',
            lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
            activated: user.activated,
            role: user.role,
          })),
          R.sortWith([R.descend(R.prop('lastSignin'))]),
        )(items),
      };
    }

    throw new NotFoundException('Users is empty');
  }

  async activateUser(activationId: string): Promise<ActivateUserResponseType> {
    const activation = await this.activationServices.getActivation({
      activationId,
    });

    if (!activation) {
      throw new NotFoundException('Activation not found');
    }

    const user = await this.usersRepository.findOne({
      where: {
        userId: activation.userId,
      },
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
      status: true,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        division: user.division,
        designation: user.designation,
        joined: user.joined ? user.joined.toISOString() : '',
        lastModified: user.lastModified ? user.lastModified.toISOString() : '',
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : '',
        activated: user.activated,
      },
    };
  }

  async validateEmail(
    validateEmailInput: string,
  ): Promise<ValidateEmailResponseType> {
    const user = await this.usersRepository.findOne({
      where: {
        email: validateEmailInput,
      },
    });
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    return {
      status: true,
    };
  }

  async updateUserEmailInDB(userId: string, email: string): Promise<User> {
    const response = await this.usersRepository.update({ userId }, { email });

    const { affected } = response;
    if (affected === 0) {
      throw new BadRequestException('Update user email failed');
    }
    const updatedUser = await this.usersRepository.findOne({
      where: { userId },
    });

    return updatedUser;
  }

  async changeUserEmail(
    changeUserEmailInput: ChangeUserEmailInput,
  ): Promise<ChangeUserEmailResponseType> {
    const { userId, newEmail } = changeUserEmailInput;
    const userToUpdate = await this.usersRepository.findOne({
      where: {
        userId,
      },
    });
    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersRepository.findOne({
      where: {
        email: newEmail,
      },
    });
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    await this.updateUserEmailInDB(userId, newEmail);

    return {
      email: newEmail,
    };
  }

  async changeUserPassword(
    changeUserPasswordInput: ChangeUserPasswordInput,
  ): Promise<ChangeUserPasswordResponseType> {
    const user = await this.usersRepository.findOne({
      where: {
        userId: changeUserPasswordInput.userId,
      },
    });

    if (user) {
      const signin = await this.signinServices.getSignin({
        email: user.email,
      });
      if (
        await bcrypt.compare(changeUserPasswordInput.oldPassword, signin.hash)
      ) {
        await this.signinServices.changeUserPassword(
          user.email,
          changeUserPasswordInput.newPassword,
        );

        return {
          status: true,
        };
      }

      throw new UnauthorizedException('Wrong password');
    }

    throw new NotFoundException('User not found');
  }

  async validatePassword(
    validatePasswordInput: ValidatePasswordInput,
  ): Promise<ValidatePasswordResponseType> {
    let user = null;
    if (validatePasswordInput.email) {
      user = await this.usersRepository.findOne({
        where: {
          email: validatePasswordInput.email,
        },
      });
    } else if (validatePasswordInput.activationId) {
      const activation = await this.activationServices.getActivation({
        activationId: validatePasswordInput.activationId,
      });
      user = await this.usersRepository.findOne({
        where: {
          userId: activation.userId,
        },
      });
    }

    if (user) {
      const isPasswordCorrect = await this.signinServices.validatePassword(
        user.email,
        validatePasswordInput.password,
      );

      if (isPasswordCorrect) {
        return {
          status: true,
        };
      }

      throw new UnauthorizedException('Wrong password');
    }

    throw new NotFoundException('User not found');
  }
}
