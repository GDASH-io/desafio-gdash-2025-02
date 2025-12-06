import { Either, left, right } from "@/core/either";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

interface DeleteUserUseCaseRequest {
  userId: string;
}

type DeleteUserUseCaseResponse = Either<
  UserNotFoundError,
  Record<string, never>
>;

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    await this.userRepository.delete(userId);

    return right({});
  }
}
