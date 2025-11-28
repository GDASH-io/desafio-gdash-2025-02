import type { LoginFormValues } from "@/pages/login/schema";
import { useLoginMutation, useLogoutMutation } from "./api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useLogin = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormValues) => {
    try {
      await login(data).unwrap();
      toast.success("Login realizado com sucesso!", {
        description: "Bem-vindo ao GDash!",
      });
      navigate("/weather");
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error("Erro ao fazer login", {
        description: message || "Credenciais inválidas",
      });
    }
  };

  return {
    handleLogin,
    isLoading,
  };
};

export const useLogout = () => {
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error("Erro ao fazer logout", {
        description: message || "Tente novamente",
      });
    }
  };

  return { handleLogout, isLoading };
};
