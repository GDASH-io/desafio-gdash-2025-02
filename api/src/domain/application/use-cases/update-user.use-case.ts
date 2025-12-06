import { Either, left, right } from "@/core/either";
import { User } from "@/domain/enterprise/entities/user";
import { UserRepository } from "../repositories/user-repository";
import { HashProvider } from "../providers/hash-provider";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { Injectable } from "@nestjs/common";

interface UpdateUserUseCaseRequest {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user";
}

type UpdateUserUseCaseResponse = Either<
  UserNotFoundError | UserAlreadyExistsError,
  {
    user: User;
  }
>;

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider
  ) {}

  async execute({
    userId,
    name,
    email,
    password,
    role,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    if (email && email !== user.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(email);
      if (userWithSameEmail) {
        return left(new UserAlreadyExistsError(email));
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      const hashedPassword = await this.hashProvider.hash(password);
      user.password = hashedPassword;
    }

    if (role) {
      user.role = role;
    }

    await this.userRepository.save(user);

    return right({ user });
  }
}
