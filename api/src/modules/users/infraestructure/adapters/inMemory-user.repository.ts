import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/types';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserRepositoryPort } from '../../ports/user.repository.port';
import { UserDocument } from '../schema/user.schema';

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private users: UserDocument[] = [];
  private idCounter = 1;

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = {
      _id: String(this.idCounter++),
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as UserDocument;

    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  findAll(): Promise<UserDocument[]> {
    return Promise.resolve([...this.users]);
  }

  findOneById(id: string): Promise<UserDocument | null> {
    const user = this.users.find((u) => String(u._id) === id);
    return Promise.resolve(user || null);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    const user = this.users.find((u) => u.email === email);
    return Promise.resolve(user || null);
  }

  update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    const userIndex = this.users.findIndex((u) => String(u._id) === id);

    if (userIndex === -1) {
      return Promise.resolve(null);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return Promise.resolve(this.users[userIndex]);
  }

  remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex((u) => String(u._id) === id);

    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }

    return Promise.resolve();
  }

  clear(): void {
    this.users = [];
    this.idCounter = 1;
  }

  getAll(): UserDocument[] {
    return [...this.users];
  }
}
