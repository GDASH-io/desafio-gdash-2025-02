import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface UsersTableProps {
  users: { id: string; name: string; email: string; createdAt: string }[] | any
  loading: boolean
  onDelete: (id: string) => Promise<void>
  deleting: boolean
}

export function UsersTable({ users, loading, onDelete, deleting }: UsersTableProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-800 border-slate-800">
              <TableHead className="text-slate-400 pl-6">Nome</TableHead>
              <TableHead className="text-slate-400">E-mail</TableHead>
              <TableHead className="text-slate-400">Data Cadastro</TableHead>
              <TableHead className="text-slate-400 text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-slate-500">Carregando usuários...</TableCell>
              </TableRow>
            ) : users?.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-800/50 border-slate-800">
                <TableCell className="font-medium text-white pl-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    {user.name || "Sem nome"}
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">{user.email}</TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                    onClick={() => onDelete(user.id)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
