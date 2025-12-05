import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

export function useAllUsers() {
  const req = useQuery<
    AxiosResponse<{
      message: {
        _id: string,
        name: string,
        email: string,
        tokenVersion: number,
        createdAt: string,
        updatedAt: string
      }[]
    }>
  >({
    queryKey: ["getAllUsers"],
    queryFn: async () => await api.get("/user/all"),
    staleTime: 1000 * 60 * 10
  });

  return {
    users: req.data?.data.message,
    isLoading: req.isLoading,
    isError: req.isError,
    refetch: req.refetch

  }
}