import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/userType";

export function useUsers() {
  //  Estados de Dados
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  //  Estados de Filtro
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    date: "",
  });

  //  Estados dos Modais
  const [modals, setModals] = useState({
    form: false,
    delete: false,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  //  Fetch Inicial
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  //  Lógica de Filtragem )
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.email
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesRole = filters.role === "all" || user.role === filters.role;

      let matchesDate = true;
      if (filters.date && user.createdAt) {
        const userDate = new Date(user.createdAt).toISOString().split("T")[0];
        matchesDate = userDate === filters.date;
      }

      return matchesSearch && matchesRole && matchesDate;
    });
  }, [users, filters]);

  //  Actions (CRUD Handlers)

  const openCreateModal = () => {
    setSelectedUser(null);
    setModals((prev) => ({ ...prev, form: true }));
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setModals((prev) => ({ ...prev, form: true }));
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModals((prev) => ({ ...prev, delete: true }));
  };

  const closeModals = () => {
    setModals({ form: false, delete: false });

    setTimeout(() => setSelectedUser(null), 300);
  };

  const handleFormSubmit = async (
    data: CreateUserPayload | UpdateUserPayload
  ) => {
    try {
      if (selectedUser && modals.form) {
        // Edição
        await userService.updateUser(
          selectedUser._id,
          data as UpdateUserPayload
        );
        toast.success("Usuário atualizado!");
      } else {
        // Criação
        await userService.createUser(data as CreateUserPayload);
        toast.success("Usuário criado!");
      }
      closeModals();
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Falha ao salvar dados.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover usuário.");
    } finally {
      closeModals();
    }
  };

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", role: "all", date: "" });
  };

  return {
    data: {
      users: filteredUsers, // Retorna já filtrado
      selectedUser,
    },
    ui: {
      loading,
      modals,
      filters,
      hasActiveFilters: Boolean(
        filters.search || filters.role !== "all" || filters.date
      ),
    },
    actions: {
      openCreateModal,
      openEditModal,
      openDeleteModal,
      closeModals,
      handleFormSubmit,
      handleDeleteConfirm,
      setFilter,
      clearFilters,
    },
  };
}
