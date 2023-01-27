import * as R from 'ramda';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { NaasExceptionFilter } from '../exception-filter/exception.filter';
// inputs
import { UpdateAuthTokenInput } from './inputs/update-auth-token.input';
import { SignOutInput } from './inputs/sign-out.input';
// types
import { UpdateAuthTokenResponseType } from './types/update-auth-token-response.type';
import { SignOutResponseType } from './types/sign-out-response.type';
// services
import { TmJwtService } from './tm-jwt.service';

/**
 * GraphQL resolver for JWT.
 */
@Resolver()
@UseFilters(NaasExceptionFilter)
export class UserResolver {
  constructor(private tmJwtService: TmJwtService) {}

  /**
   * Update Auth Token
   */
  @Mutation(() => UpdateAuthTokenResponseType)
  async updateAuthToken(
    @Args('updateAuthTokenInput')
    updateAuthTokenInput: UpdateAuthTokenInput,
  ): Promise<UpdateAuthTokenResponseType> {
    const updateAuthTokenResponse = await this.tmJwtService.updateAuthToken(
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
    const signOutResponse = await this.tmJwtService.signOut(signOutInput);
    return signOutResponse;
  }
}
