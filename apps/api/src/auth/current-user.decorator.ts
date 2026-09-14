import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from './jwt-auth.guard';

/** Injects the caller that JwtAuthGuard put on the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser =>
    context.switchToHttp().getRequest<Request & { user: RequestUser }>().user,
);
