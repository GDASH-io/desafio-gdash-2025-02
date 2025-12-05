import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteUser(email: string) {
  const client = useQueryClient();
  const req = useMutation({
    mutationKey: ["deleteUser"],
    mutationFn: async (email: string) => {
      const res = await api.delete("/user/delete", { data: { email } })
      return res
    },
    onSuccess: (res) => {
      client.invalidateQueries({ queryKey: ["getAllUsers"] });
      toast.success(res.data.message)
    }
  });

  async function deleteUser() {
    req.mutate(email);
  }


  return { deleteUser }
}