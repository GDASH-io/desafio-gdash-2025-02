import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/modules/users/infraestructure/schema/user.schema';
import { UserRole } from 'src/types';
import { AuthRepositoryPort } from '../../ports/auth.repository.port';

@Injectable()
export class InMemoryAuthRepository implements AuthRepositoryPort {
  private users: UserDocument[] = [];
  private idCounter = 1;

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const user = this.users.find((u) => u.email === email);
    return Promise.resolve(user || null);
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    const newUser = {
      _id: String(this.idCounter++),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as UserDocument;

    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  clear(): void {
    this.users = [];
    this.idCounter = 1;
  }

  getAll(): UserDocument[] {
    return [...this.users];
  }

  findById(id: string): UserDocument | null {
    const user = this.users.find((u) => String(u._id) === id);
    return user || null;
  }
}
