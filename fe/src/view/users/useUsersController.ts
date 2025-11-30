import { useAuth } from "@/app/hooks/useAuth";
import { useQuery } from "@/app/hooks/useQuery";
import { UserService } from "@/app/service/users";
import { isAxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

export function useUserController() {
  const { isMe, isAdmin, user } = useAuth();
  const [userToEdit, setUserToEdit] = useState<null | {
    id: string;
    name: string;
    email: string;
  }>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState("");
  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    fetcher: UserService.getAllUsers,
  });

  const onCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
    refetch();
  };

  const onCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const onDeleteUser = async () => {
    try {
      await UserService.deleteUser(isDeleteDialogOpen);
      setIsDeleteDialogOpen("");
      refetch();
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message || "Não foi possível deletar o usuário"
        );
      } else {
        toast.error("Não foi possível realizar a exclusão");
      }
    }
  };

  return {
    isMe,
    isAdmin,
    user,
    userToEdit,
    setUserToEdit,
    isEditModalOpen,
    setIsEditModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    users,
    isLoading,
    onCloseEditModal,
    onCloseCreateModal,
    onDeleteUser,
  };
}
