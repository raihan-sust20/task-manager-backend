import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Obtain the current user from the context via the {@link TmJwtGuard}, and
 * provide it to the caller.
 *
 * This decorator should not be used without {@link TmJwtGuard}, otherwise it will
 * return `undefined`.
 */
export const TmJwtUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().user;
  },
);
