import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import * as R from 'ramda';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { TmJwtService } from './tm-jwt.service';
import { NaasExceptionFilter } from '../exception-filter/exception.filter';

/**
 * Obtain the JWT from the HTTP request headers, validate it against the
 * AuthService via gRPC, and place the user into the context for
 * {@link JwtUser}.
 */
@Injectable()
@UseFilters(NaasExceptionFilter)
export class TmJwtGuard implements CanActivate {
  constructor(
    private jwtService: TmJwtService,

    private configService: ConfigService,

    private reflector: Reflector,
  ) {}

  getUserIdsInArgs = R.curry(
    (coreArgsData: Record<string, any>[]): string[] => {
      return R.map(
        (coreArgsDataItem) => R.prop('userId', coreArgsDataItem),
        coreArgsData,
      );
    },
  );

  /**
   * Check whether the provided args is applicable for 'USER' or 'ADMIN'
   */
  confirmUserArgs = R.curry(
    (gqlExecutionContext: GqlExecutionContext, userId: string) => {
      const resolverMethod = gqlExecutionContext.getHandler();
      const argsPath = this.reflector.get<string[]>('argsPath', resolverMethod);
      const args = gqlExecutionContext.getArgs();

      const coreArgsData = R.view(R.lensPath(argsPath), args);
      if (!coreArgsData) {
        return false;
      }

      const userIdsInArgs = R.pipe<Record<string, any>[], string[], string[]>(
        this.getUserIdsInArgs as (param: Record<string, any[]>) => string[],
        // Filter out empty user ID and user IDs of any user(s) other than logged in user(if exists)
        R.filter(
          (userIdInArgsItem: string) =>
            userIdInArgsItem && userIdInArgsItem === userId,
        ),
      )(coreArgsData);

      // For every argument item the user ID must be same as current logged in user ID.
      if (R.length(userIdsInArgs) !== R.length(coreArgsData)) {
        return false;
      }

      return true;
    },
  );

  /**
   * Check if authenticated is authorized to access the resolver method.
   */
  checkAuthorization = R.curry(
    (
      gqlExecutionContext: GqlExecutionContext,
      userId: string,
      userRole: string,
    ): boolean => {
      const resoverMethod = gqlExecutionContext.getHandler();
      const permittedRoles = this.reflector.get<string[]>(
        'roles',
        resoverMethod,
      );

      // Authenticated user with any role have access to the resolver method.
      if (!permittedRoles) {
        return true;
      }

      if (!R.includes(userRole, permittedRoles)) {
        throw new ForbiddenException('Access denied!');
      }

      // If the resolver method can be accessed by both USER and ADMIN role user.
      if (userRole === 'USER' && R.includes('USER', permittedRoles)) {
        const isArgsForUser = this.confirmUserArgs(gqlExecutionContext, userId);

        // If user role is 'USER' but the args in query can be only be used by 'ADMIN'
        if (!isArgsForUser) {
          throw new ForbiddenException('Access denied!');
        }
      }
      return true;
    },
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlExecutionContext = GqlExecutionContext.create(context);
    const jwtGuardStatus = this.configService.get<string>('JWT_GUARD', 'ON');
    if (jwtGuardStatus === 'OFF') {
      return true;
    }

    const authHeader = gqlExecutionContext
      .getContext()
      .request.get('Authorization');
    const authHeaderRegex =
      /^Bearer ([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)$/;
    // authHeader should exist, and it should match our regex pattern.
    if (authHeader && authHeaderRegex.test(authHeader)) {
      // Since the regex test returned true, we are guaranteed to have a
      // capture group stored at index 1.
      const jwt = authHeader.match(authHeaderRegex)[1];
      const user = await this.jwtService.validateJwt(jwt);

      if (user !== null) {
        const { userId, role: userRole } = R.pick(['userId', 'role'], user);
        const isUserAuthroized = this.checkAuthorization(
          gqlExecutionContext,
          userId,
          userRole,
        );
        gqlExecutionContext.getContext().user = user;
        return isUserAuthroized;
      }
    }

    throw new UnauthorizedException('Please login first!');
  }
}
