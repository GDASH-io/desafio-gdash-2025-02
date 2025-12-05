import React, { useState, useCallback, type ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import UsersService from "../service/user.service";
import type {
  IUser,
  IPaginatedUsersResponse,
} from "../interfaces/user.interface";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import { UsersContext, type IUsersContext } from "./userContextDefinition";

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const { logout } = useAuth();

  const fetchUsers = useCallback(
    async (page: number = currentPage) => {
      setIsLoading(true);
      setError(null);
      try {
        const data: IPaginatedUsersResponse = await UsersService.listAll(page);
        setUsers(data.data);
        setCurrentPage(data.pagina_atual);
        setTotalPages(data.total_paginas);
        setTotalItems(data.total_items);
      } catch (err) {
        console.error("Falha ao buscar usuários:", err);
        const message =
          (err as any).response?.data?.message ||
          "Não foi possível carregar a lista de usuários.";
        setError(message);
        if ((err as any).response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const runMutation = useCallback(
    async (action: () => Promise<IUser | void>, successMessage: string) => {
      try {
        await action();
        fetchUsers();
        toast({ title: "Sucesso!", description: successMessage });
      } catch (err) {
        const message =
          (err as any).response?.data?.message ||
          "Ocorreu um erro na operação.";
        toast({ title: "Erro", description: message, variant: "destructive" });
        throw err;
      }
    },
    [fetchUsers, toast]
  );

  const createUser = useCallback(
    async (data: CreateUserDto) => {
      await runMutation(
        () => UsersService.create(data),
        "Novo usuário criado com sucesso."
      );
    },
    [runMutation]
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserDto) => {
      await runMutation(
        () => UsersService.update(id, data),
        "Usuário atualizado com sucesso."
      );
    },
    [runMutation]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await runMutation(
        () => UsersService.remove(id),
        "Usuário removido com sucesso."
      );
    },
    [runMutation]
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page);
    }
  };

  const contextValue: IUsersContext = {
    users,
    isLoading,
    error,
    fetchUsers: () => fetchUsers(currentPage),
    createUser,
    updateUser,
    deleteUser,
    currentPage,
    totalPages,
    totalItems,
    changePage,
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};
