import * as R from 'ramda';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import {
  UsePipes,
  ValidationPipe,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { NaasExceptionFilter } from '../exception-filter/exception.filter';
// services
import { JwtService } from './tm-jwt.service';
// inputs
import { UpdateAuthTokenInput } from './inputs/update-auth-token.input';
// types
import { UpdateAuthTokenResponseType } from './types/update-auth-token-response.type';

/**
 * GraphQL resolver for JWT.
 */
@Resolver()
@UseFilters(NaasExceptionFilter)
export class UserResolver {
  constructor(private jwtService: JwtService) {}

  /**
   * Update Auth Token
   */
  @Mutation(() => UpdateAuthTokenResponseType)
  async updateAuthToken(
    @Args('updateAuthTokenInput')
    updateAuthTokenInput: UpdateAuthTokenInput,
  ): Promise<UpdateAuthTokenResponseType> {
    const updateAuthTokenResponse = await this.jwtService.updateAuthToken(
      updateAuthTokenInput,
    );
    return updateAuthTokenResponse;
  }

  /**
   * Sign out user
   */
  @Mutation(() => SignOutResponseType)
  async signOut(
    @Args('signOutInput')
    signOutInput: SignOutInput,
  ): Promise<SignOutResponseType> {
    const signOutResponse = await this.userService.signOut(signOutInput);
    return signOutResponse;
  }
}
