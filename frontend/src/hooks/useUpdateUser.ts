import { api } from "@/api/api";
import { userAtom } from "@/atom/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { toast } from "sonner";

export type PatchOptions = {
  name?: string;
  email?: string;
  password?: string;
}

export function useUpdateUser(email: string) {
  const client = useQueryClient();
  const [user,setUser] = useAtom(userAtom)
  const req = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: async ({email, update}: {email: string, update: PatchOptions}) => {
      const res = await api.patch("/user/update", {email, update})
      return res
    },
    onSuccess: async (res, {email}) => {
      client.invalidateQueries({ queryKey: ["getAllUsers"] });
      toast.success(res.data.message)
      if(user?.email === email) {
        toast.info("Faça login novamente!")
        await api.post("/user/logout")
        setUser(null)
      }
    }
  });

  async function updateUser(update: PatchOptions) {
    req.mutate({email, update});
  }


  return { updateUser }
}