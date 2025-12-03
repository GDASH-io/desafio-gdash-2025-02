import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { User } from '@/domain/enterprise/entities/user';
import { User as PrismaClient } from '@prisma/client';

export class PrismaUserMapper {
  static toDomain(raw: PrismaClient): User {
    return User.create(
      {
        name: raw.name,
        userName: raw.userName,
        email: raw.email,
        password: raw.password,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPrisma(user: User): PrismaClient {
    return {
      id: user.id.toString(),
      name: user.name,
      userName: user.userName,
      email: user.email,
      password: user.password,
    };
  }
}
