import { LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TypographyH3, TypographyMuted } from "../ui/tipography";
import { userAtom } from "@/atom/store";
import { useAtomValue } from "jotai";
import { useLogout } from "@/hooks/useLogout";

export function UserAccount() {
  const user = useAtomValue(userAtom);
  const { logout } = useLogout();

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center">
          <TypographyH3>Erro</TypographyH3>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Olá, {user.name}</CardTitle>
          <CardAction>
            <Button variant={"outline"} onClick={() => logout()}><LogOutIcon />Sair</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <div className="w-18 h-18 bg-accent flex items-center justify-center rounded-full">
            <b>{user.name.charAt(0).toUpperCase()}</b>
          </div>
          <div className="flex flex-col gap-2">
            <span>{user.name}</span>
            <TypographyMuted>{user.email}</TypographyMuted>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}