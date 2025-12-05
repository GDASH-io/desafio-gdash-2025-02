import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import type {
  IPaginatedUsersResponse,
  IUser,
} from "../interfaces/user.interface";
import api from "./api";

const UsersService = {
  listAll: async (page: number = 1): Promise<IPaginatedUsersResponse> => {
    const response = await api.get<IPaginatedUsersResponse>(
      `/users?page=${page}`
    );
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<IUser> => {
    const response = await api.post<IUser>("/users", data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<IUser> => {
    const response = await api.patch<IUser>(`/users/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default UsersService;
