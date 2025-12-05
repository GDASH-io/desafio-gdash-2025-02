import { userAtom } from "@/atom/store";
import { useAtomValue } from "jotai";
import { Navigate, Outlet } from "react-router";

export function RequireAuth() {
  const user = useAtomValue(userAtom);
  
  return user ? <Outlet/> : <Navigate to="/" replace />;

}