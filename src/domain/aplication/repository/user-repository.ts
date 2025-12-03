import type { User } from '@/domain/enterprise/entities/user';

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUserName(userName: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
