import { UserEntity } from './user.entity';

export interface IUsersRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
}

export const IUsersRepository = Symbol('IUsersRepository');
