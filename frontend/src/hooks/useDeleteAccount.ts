import { api } from "@/api/api";
import { userAtom, type User } from "@/atom/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { toast } from "sonner";

export function useDeleteAccount() {
  const client = useQueryClient()
  const [user, setUser] = useAtom(userAtom)
  const req = useMutation({
    mutationKey: ["deleteUser"],
    mutationFn: async ({email, password}:{email: string, password: string}) => {
      const res = await api.delete("/user/delete/account", { data: { email,password } })
      return res
    },
    onSuccess: (res) => {
      toast.success(res.data.message)
      setUser(null)
      localStorage.removeItem("user");
      client.invalidateQueries({queryKey: ["deleteUser"]});
    }
  });

  async function deleteAccount(password:string) {
    req.mutate({email: (user as User).email, password});
  }


  return { deleteAccount }
}