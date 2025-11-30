import { httpClient } from "./httpClient";

export class UserService {
  static async getMe(signal?: AbortSignal) {
    const { data, status } = await httpClient.get<UserService.GetMeOutput>(
      "/users/me",
      { signal }
    );

    return status === 200 ? data : undefined;
  }

  static async getAllUsers(signal?: AbortSignal) {
    const { data, status } = await httpClient.get<UserService.GetAllUserOutPut>(
      "/users",
      { signal }
    );

    return status === 200 ? data.data : undefined;
  }

  static async updateUser(params: UserService.UpdateUserInput) {
    await httpClient.put<void>(`/users/${params.id}`, {
      name: params.name,
      email: params.email,
    });
  }

  static async updateMe(params: UserService.UpdateUserInput) {
    await httpClient.put<void>(`/users/me`, {
      name: params.name,
      email: params.email,
    });
  }

  static async createUser(params: UserService.CreateUserInput) {
    await httpClient.post<void>(`/users`, params);
  }
  
  static async deleteUser(params: UserService.DeleteUserInput) {
    await httpClient.delete<void>(`/users/${params}`);
  }
}


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserService {
  export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
  }

  export type GetMeOutput = {
    id: string;
    name: string;
    email: string;
    role: Role;
  };

  export type GetAllUserOutPut = {
    data: {
      id: string;
      name: string;
      email: string;
      role: Role;
    }[];
  };

  export type UpdateUserInput = {
    id: string;
    name: string;
    email: string;
  };

  export type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    role: Role;
  };

  export type DeleteUserInput = string;
}
