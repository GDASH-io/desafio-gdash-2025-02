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
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 border-border">
              <TableHead className="text-muted-foreground pl-6">Nome</TableHead>
              <TableHead className="text-muted-foreground">E-mail</TableHead>
              <TableHead className="text-muted-foreground">Data Cadastro</TableHead>
              <TableHead className="text-muted-foreground text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Carregando usuários...</TableCell>
              </TableRow>
            ) : users?.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50 border-border">
                <TableCell className="font-medium text-foreground pl-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    {user.name || "Sem nome"}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
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
