import { userAtom } from "@/atom/store"
import { useAtomValue } from "jotai"
import type React from "react";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

export function RequireRole({ children }: { children: React.ReactNode }) {

  const user = useAtomValue(userAtom);

  if (!user?.isAdmin) {
    return (
      <Card className="absolute top-1/2 left-1/2 -translate-1/2">
        <CardContent>
          <CardTitle className="text-center text-base">401</CardTitle>
          <CardDescription className="text-center mt-3">
            Você não tem autorização para acessar esta página
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return children
}