import { User } from "@/domain/enterprise/entities/user";

export interface FindManyParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FindManyResult {
  users: User[];
  total: number;
}

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findMany(params: FindManyParams): Promise<FindManyResult>;
  abstract save(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
