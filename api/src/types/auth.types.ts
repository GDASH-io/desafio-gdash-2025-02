import { UserRole } from './roles.enum';

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
