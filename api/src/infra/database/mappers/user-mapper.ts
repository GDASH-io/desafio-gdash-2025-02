import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { User } from "@/domain/enterprise/entities/user";
import { UserDocument } from "../schemas/user.schema";

export class UserMapper {
  static toDomain(raw: UserDocument): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        role: raw.role,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw._id.toString())
    );
  }

  static toPersistence(user: User) {
    return {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
