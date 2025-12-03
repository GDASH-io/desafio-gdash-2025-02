import { getUser } from "@/services/getUser";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetUser = () => {
  const { logout } = useAuthStore();
  return useQuery({
    queryKey: ["loggedUser"],
    queryFn: async () => {
      try {
        const data = await getUser();
        return data;
      } catch (error) {
        toast.error("Sessao expirada");
        logout();
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
