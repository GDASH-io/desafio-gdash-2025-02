import { UserDocument } from 'src/modules/users/infraestructure/schema/user.schema';
import { UserRole } from 'src/types';

export interface AuthRepositoryPort {
  findUserByEmail(email: string): Promise<UserDocument | null>;
  createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<UserDocument>;
}
