import { Either, left, right } from "@/core/either";
import { User } from "@/domain/enterprise/entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

interface GetUserByIdUseCaseRequest {
  userId: string;
}

type GetUserByIdUseCaseResponse = Either<
  UserNotFoundError,
  {
    user: User;
  }
>;

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    return right({ user });
  }
}
