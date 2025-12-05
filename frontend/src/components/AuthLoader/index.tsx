import { userAtom } from "@/atom/store";
import { verifyLogin } from "@/utils/verifyLogin";
import { useAtom } from "jotai";
import type React from "react";
import { useEffect, useState } from "react";
import { TypographyH1 } from "../ui/tipography";
import { LoaderCircleIcon } from "lucide-react";

export function AuthLoader({ children }: { children: React.ReactNode }) {

  const [isLoading, setIsLoading] = useState(true);
  const [_, setUser] = useAtom(userAtom);

  useEffect(() => {
    verifyLogin()
      .then(isValid => {
        if (!isValid) {
          setUser(null)
          localStorage.removeItem("user");
        }
      }).finally(() => setIsLoading(false));
  }, [])

  if (isLoading) {
    return (
      <section className="flex flex-col justify-center z-0 h-screen items-center bg-[#00000021]">
        <TypographyH1>Verificando credenciais</TypographyH1>
        <div className="flex items-center mt-5 gap-2">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight ">Aguarde</h3>
          <LoaderCircleIcon size={40} className="animate-spin" />
        </div>
      </section>
    )
  }

  return children
}