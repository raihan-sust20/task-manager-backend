import * as R from "ramda";
import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RpcException } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { InjectStripe } from "nestjs-stripe";
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from "nestjs-typeorm-paginate";
import * as grpc from "grpc";
import * as Promise from "bluebird";
import * as bcrypt from "bcrypt";
import { Stripe } from "stripe";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { FirstSigninService } from "../first-signin/first-signin.service";
import { StripeService } from "../stripe/stripe.service";
import { UserRepository } from "./user.repository";

import { ActivationService } from "./activation/activation.service";
import { NaasJwtService } from "../naas-jwt/naas-jwt.service";
import { SigninService } from "./signin/signin.service";
import { ISignin, IUser } from "./interfaces/user.interface";
import {
  IGetUserById,
  IGetUserByIdResult,
} from "./interfaces/get-user-by-id.interface";
import { IActivateUserResult } from "./interfaces/activate-user.interface";
import { IValidateEmail } from "./interfaces/validate-ser.interface";
import { ISigninResult } from "./interfaces/signin.interface";
import { ISignupResult } from "./interfaces/signup.interface";
import {
  IChangeUserEmail,
  IChangeUserEmailResult,
} from "./interfaces/change-user-email.interface";
import { IChangeUserPassword } from "./interfaces/change-user-password.interface";
import { IValidatePassword } from "./interfaces/validate-password.interface";
import { User } from "./entities/user.entity";
import { naas } from "../proto/naas.auth";

/**
 * Component for handling UserService requests.
 */
@Injectable()
export class UserService {
  private readonly ADMIN_SIGN_UP_UNLOCK_KEY;

  constructor(
    @InjectRepository(UserRepository)
    private usersRepository: UserRepository,

    private readonly firstSigninServices: FirstSigninService,
    private readonly signinServices: SigninService,
    @Inject(forwardRef(() => NaasJwtService))
    private readonly naasJwtService: NaasJwtService,

    @InjectStripe()
    private stripeClient: Stripe,

    // FOR DEV ONLY
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => ActivationService))
    private readonly activationServices: ActivationService,

    private configService: ConfigService
  ) {
    this.ADMIN_SIGN_UP_UNLOCK_KEY = this.configService.get<string>(
      "ADMIN_SIGN_UP_UNLOCK_KEY"
    );
  }

  async paginate(
    options: naas.auth.pagination.IPagination,
    query?: Record<any, any>
  ): Promise<Pagination<User>> {
    const { page, limit } = options;
    return paginate<User>(
      this.usersRepository,
      {
        page: page || 1,
        limit: limit || 20,
      },
      query
    );
  }

  /**
   * Compare a email and password against the database and return a JSON Web
   * Token (if the login was successful).
   * @param signinRequest ISigninResult
   */
  async signin(signinRequest: ISignin): Promise<ISigninResult> {
    const user = await this.usersRepository.findOne({
      email: signinRequest.email,
    });

    if (user) {
      const signin = await this.signinServices.getSignin({
        email: signinRequest.email,
      });

      const userRole = R.prop("role", user);

      const { role } = signinRequest;
      const isAdminKey =
        role === "admin"
          ? signinRequest.password === process.env.ADMIN_KEY
          : false;
      const isPasswordMatch = await bcrypt.compare(
        signinRequest.password,
        signin.hash
      );
      if (isAdminKey || isPasswordMatch) {
        if (!user.activated) {
          throw new RpcException({
            code: grpc.status.UNAUTHENTICATED,
            message: "User is not activated. Please check your email",
          });
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
          joined: user.joined ? user.joined.toISOString() : "",
          modified: user.modified ? user.modified.toISOString() : "",
          lastSignin: user.lastSignin ? user.lastSignin.toISOString() : "",
          activated: user.activated,
          role: user.role,
          ...authToken,
        };
      }

      throw new RpcException({
        code: grpc.status.UNAUTHENTICATED,
        message: "Wrong credentials",
      });
    }

    throw new RpcException({
      code: grpc.status.NOT_FOUND,
      message: "Wrong credentials, User not found",
    });
  }

  async signup(
    signupRequest: naas.auth.user.ISignupRequest
  ): Promise<ISignupResult> {
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
      throw new RpcException({
        code: grpc.status.ALREADY_EXISTS,
        message: "User already exists",
      });
    }

    const isAdmin = this.ADMIN_SIGN_UP_UNLOCK_KEY === adminKey;
    if (adminKey !== "N/A" && !isAdmin) {
      throw new RpcException({
        code: grpc.status.UNAUTHENTICATED,
        message: "Invalid admin key",
      });
    }
    const newUser = await this.usersRepository.createUser(
      email,
      settings,
      isAdmin
    );
    await this.signinServices.createSignin(email, password);

    const { userId, role } = newUser;

    const firstSignin = createFirstSignin
      ? await this.firstSigninServices.createFirstSignin({ userId })
      : {};

    const newActivation = await this.activationServices.createActivation(
      userId
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
        lang || "en"
      );
    }
    // admin feature: activate user
    if (activateUser) {
      await this.activateUser({ userId });
    }

    return {
      userId: newUser.userId,
      email: newUser.email,
      joined: newUser.joined ? newUser.joined.toISOString() : "",
      modified: "",
      lastSignin: "",
      activated: activateUser,
      role: newUser.role,
      firstSignin,
      ...authToken,
    };
  }

  @Transactional()
  async getUserById(
    getUserByIdRequest: IGetUserById
  ): Promise<IGetUserByIdResult> {
    const user = await this.usersRepository.findOne({
      userId: getUserByIdRequest.userId,
    });
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        role: user.role,
        joined: user.joined ? user.joined.toISOString() : "",
        modified: user.modified ? user.modified.toISOString() : "",
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : "",
        activated: user.activated,
      };
    }

    throw new RpcException({
      code: grpc.status.NOT_FOUND,
      message: "User not found",
    });
  }

  async SignupUsers(
    request: naas.auth.user.ISignupUsersRequest
  ): Promise<naas.auth.user.ISignupUsersResponse> {
    const { data } = request;
    const users = await Promise.map(data, async (item) => this.signup(item));
    return { items: users };
  }

  @Transactional()
  async getUser(query: Record<string, unknown>): Promise<IUser> {
    const user = await this.usersRepository.findOne(query);
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        joined: user.joined ? user.joined.toISOString() : "",
        modified: user.modified ? user.modified.toISOString() : "",
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : "",
        activated: user.activated,
      };
    }

    throw new RpcException({
      code: grpc.status.NOT_FOUND,
      message: "User not found",
    });
  }

  @Transactional()
  async getUsers(
    query: Record<string, unknown>,
    pagination?: naas.auth.pagination.IPagination
  ): Promise<IUser> {
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
            joined: user.joined ? user.joined.toISOString() : "",
            modified: user.modified ? user.modified.toISOString() : "",
            lastSignin: user.lastSignin ? user.lastSignin.toISOString() : "",
            activated: user.activated,
            role: user.role,
            haveUnUniFiEarning: user.haveUnUniFiEarning,
          })),
          R.sortWith([R.descend(R.prop("joined"))])
        )(items),
      };
    }

    throw new RpcException({
      code: grpc.status.NOT_FOUND,
      message: "Users is empty",
    });
  }

  @Transactional()
  async activateUser(
    activateUserRequest: naas.auth.IActivateUserRequest
  ): Promise<IActivateUserResult> {
    const { userId, activationId } = activateUserRequest;

    const activation = await this.activationServices.getActivation({
      ...(activationId && { activationId }),
      ...(userId && { userId }),
    });

    if (!activation && !userId) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: "Activation not found",
      });
    }

    const user = await this.usersRepository.findOne({
      userId: activation.userId,
    });
    if (user.activated) {
      throw new RpcException({
        code: grpc.status.ALREADY_EXISTS,
        message: "User already activated",
      });
    }

    await this.usersRepository.update(
      {
        userId: activation.userId,
      },
      {
        activated: true,
      }
    );

    /*
    Add Stripe customer. this make sure every user has an stripe id
     */
    await this.stripeService.createStripeCustomer({
      userId: activation.userId,
    });

    await this.activationServices.deleteActivation({
      activationId: activation.activationId,
    });

    return {
      user: {
        userId: user.userId,
        email: user.email,
        joined: user.joined ? user.joined.toISOString() : "",
        modified: user.modified ? user.modified.toISOString() : "",
        lastSignin: user.lastSignin ? user.lastSignin.toISOString() : "",
        activated: user.activated,
      },
    };
  }

  @Transactional()
  async validateEmail(validateEmailRequest: IValidateEmail): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      email: validateEmailRequest.email,
    });
    if (user) {
      throw new RpcException({
        code: grpc.status.ALREADY_EXISTS,
        message: "Email already exists",
      });
    }

    return true;
  }

  @Transactional()
  async changeUserEmail(
    changeUserEmailRequest: IChangeUserEmail
  ): Promise<IChangeUserEmailResult> {
    const { userId, newEmail } = changeUserEmailRequest;
    const userToUpdate = await this.usersRepository.findOne({
      userId,
    });
    if (!userToUpdate) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }

    const user = await this.usersRepository.findOne({
      email: newEmail,
    });
    if (user) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Email already exists",
      });
    }

    await this.stripeService.updateStripeUserEmail(userId, newEmail);
    await this.usersRepository.changeUserEmail(userId, newEmail);

    return {
      email: newEmail,
    };
  }

  @Transactional()
  async changeUserPassword(
    changeUserPasswordRequest: IChangeUserPassword
  ): Promise<boolean> {
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
          changeUserPasswordRequest.newPassword
        );

        return true;
      }

      throw new RpcException({
        code: grpc.status.UNAUTHENTICATED,
        message: "Wrong password",
      });
    }

    throw new RpcException({
      code: grpc.status.NOT_FOUND,
      message: "User not found",
    });
  }

  @Transactional()
  async validatePassword(
    validatePasswordRequest: IValidatePassword
  ): Promise<boolean> {
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
        validatePasswordRequest.password
      );

      if (isPasswordCorrect) {
        return true;
      }

      throw new RpcException({
        code: grpc.status.UNAUTHENTICATED,
        message: "Wrong password",
      });
    }

    throw new RpcException({
      code: grpc.status.NOT_FOUND,
      message: "User not found",
    });
  }
}
