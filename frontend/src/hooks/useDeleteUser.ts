import { deleteUser } from "@/services/deleteUser";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteUser = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setAuth(null, false);
    },

    onError: () => {
      toast.error("Nao foi possivel realizar cadastro");
    },
  });
};
