import { SetMetadata } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { UserRole } from 'src/types';

export const Roles = (...roles: UserRole[]) =>
  SetMetadata(commonConstants.decorators.ROLES_KEY, roles);
