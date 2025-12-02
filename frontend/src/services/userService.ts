import { api } from "@/lib/api";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/userType";

export const userService = {
  // 1. Listar todos os utilizadores
  // Chama GET /users do teu backend NestJS
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users");
    return data;
  },

  // 2. Criar novo utilizador
  // Chama POST /users
  async createUser(userData: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>("/users", userData);
    return data;
  },

  // 3. Atualizar utilizador existente
  // Chama PATCH /users/:id (Usa PATCH porque a atualização é parcial)
  async updateUser(id: string, userData: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },

  // 4. Remover utilizador
  // Chama DELETE /users/:id
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
