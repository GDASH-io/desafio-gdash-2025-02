import { login } from "@/services/loginAuth";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ access_token }) => {
      if (access_token) {
        setAuth(access_token);
      }
      toast.success("Login realizado com sucesso");
    },

    onError: () => {
      toast.error("Credenciais Incorretas");
    },
  });
};
