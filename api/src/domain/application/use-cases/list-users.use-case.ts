import { Either, right } from "@/core/either";
import { User } from "@/domain/enterprise/entities/user";
import { UserRepository } from "../repositories/user-repository";
import { Injectable } from "@nestjs/common";

interface ListUsersUseCaseRequest {
  page?: number;
  limit?: number;
  search?: string;
}

type ListUsersUseCaseResponse = Either<
  null,
  {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
>;

@Injectable()
export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    page = 1,
    limit = 20,
    search,
  }: ListUsersUseCaseRequest): Promise<ListUsersUseCaseResponse> {
    const result = await this.userRepository.findMany({
      page,
      limit,
      search,
    });

    const totalPages = Math.ceil(result.total / limit);

    return right({
      users: result.users,
      total: result.total,
      page,
      limit,
      totalPages,
    });
  }
}
