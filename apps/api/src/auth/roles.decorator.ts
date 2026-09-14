import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES = 'auth:roles';

/** Restricts a route to the given roles. Enforced by RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
