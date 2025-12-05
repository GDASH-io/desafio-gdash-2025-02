import { api } from "@/api/api";

export async function verifyLogin() {
  const res = await api.get("/user/me")
  if(res.status === 200) {
    return true
  }
  return false;
}