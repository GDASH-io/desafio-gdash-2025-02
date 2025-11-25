import type { LoginFormValues } from "./schema";
import { useLogin } from "@/modules/auth/hooks";

export const useLoginPage = () => {
  const { handleLogin, isLoading } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    handleLogin(data);
  };

  return {
    onSubmit,
    isLoading,
  };
};
