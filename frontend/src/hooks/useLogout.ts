import { api } from "@/api/api";
import { userAtom } from "@/atom/store";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse, AxiosError } from "axios";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useLogout() {
  const [, setLogged] = useAtom(userAtom);
  const navigate = useNavigate();
  const logout = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      return await api.post("/user/logout", undefined)
    },
    onSuccess: (res: AxiosResponse<{ success: boolean, message: string }>) => {
      toast.warning(res.data.message);
      localStorage.removeItem("user")
      setLogged(null)
    },
    onError: (error: AxiosError<{ success: boolean, message: string }>) => {
      if (error.status === 403) {
        toast.error(error.response?.data.message)
        setLogged(null)
        localStorage.removeItem("user")
        navigate("/login")
        return;
      }
      toast.error("Erro ao tentar deslogar")
      console.error(error)
    }
  })

  return {logout: logout.mutate}
}