import type { UserRepository } from '@/domain/aplication/repository/user-repository';
import type { User } from '@/domain/enterprise/entities/user';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(user: User): Promise<void> {
    this.items.push(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() == id);
    if (!user) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    if (!user) {
      return null;
    }
    return user;
  }

  async findByUserName(userName: string): Promise<User | null> {
    const user = this.items.find((item) => item.userName === userName);
    if (!user) {
      return null;
    }
    return user;
  }

  async save(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);
    this.items[itemIndex] = user;
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() == id);
    this.items.splice(itemIndex, 1);
  }
}
