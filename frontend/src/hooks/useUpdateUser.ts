import { update } from "@/services/updateUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: update,
    onSuccess: () => {
      toast.success("Dados atualizados com sucesso");
      queryClient.invalidateQueries({ queryKey: ["loggedUser"] });
      navigate("/");
    },

    onError: () => {
      toast.error("Nao foi possivel atualizar os dados ");
    },
  });
};
