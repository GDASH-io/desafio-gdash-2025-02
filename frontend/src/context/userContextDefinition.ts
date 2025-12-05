import { createContext } from "react";
import type { IUser } from "../interfaces/user.interface";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto";

export interface IUsersContext {
  users: IUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<void>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  changePage: (page: number) => void;
}

export const UsersContext = createContext<IUsersContext | undefined>(undefined);
