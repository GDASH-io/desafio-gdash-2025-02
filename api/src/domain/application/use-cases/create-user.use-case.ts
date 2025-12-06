import { Either, left, right } from "@/core/either";
import { User } from "@/domain/enterprise/entities/user";
import { UserRepository } from "../repositories/user-repository";
import { HashProvider } from "../providers/hash-provider";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { Injectable } from "@nestjs/common";

interface CreateUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: User;
  }
>;

@Injectable()
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider
  ) {}

  async execute({
    name,
    email,
    password,
    role,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email));
    }

    const hashedPassword = await this.hashProvider.hash(password);

    const user = User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await this.userRepository.create(user);

    return right({
      user,
    });
  }
}
