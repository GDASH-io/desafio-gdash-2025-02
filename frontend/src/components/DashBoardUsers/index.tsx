import { useAllUsers } from "@/hooks/useAllUsers"
import { Card, CardContent, CardTitle } from "../ui/card"
import { CircleXIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "../ui/button"
import { DataTable } from "./users/data-table"
import { columns } from "./users/columns"

export function DashBoardUsers() {

  const { users, isLoading, isError, refetch } = useAllUsers()

  return (
    <article>
      <h1 className="text-2xl text-center mb-3">Usuários</h1>
      {isLoading && (
        <Card>
          <CardContent className="flex gap-2 justify-center items-center m-3 md:h-20">
            <CardTitle>Carregando</CardTitle>
            <LoaderCircleIcon size={20} className="animate-spin" />
          </CardContent>
        </Card>
      )}
      {isError && (
        <Card>
          <CardContent className="flex flex-col gap-2 items-center m-3 mb-6">
            <CircleXIcon size={20} />
              <CardTitle>Falha na solicitação</CardTitle>
              <Button variant={"secondary"} className="mt-2" onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      )}
      {(!isLoading && !isError && users) && (
        <DataTable columns={columns} data={users.map(user => ({name: user.name, email: user.email, joinedAt: user.createdAt}))} />
      )}
    </article>
  )
}