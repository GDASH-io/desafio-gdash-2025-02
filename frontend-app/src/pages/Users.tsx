import { useState } from "react"
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from "@/hooks/useUsers" 
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog"
import { SideBar } from '@/components/SideBar'
import { Plus, Trash2, Pencil } from "lucide-react"

export const Users = () => {
  const { users, loading: loadingList } = useUsers()
  const { createUser, loading: loadingCreate } = useCreateUser()
  const { deleteUser, loading: loadingDelete } = useDeleteUser()
  const { updateUser, loading: loadingUpdate } = useUpdateUser()

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const resetForm = () => {
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setEditingId(null)
    setIsOpen(false)
  }

  const handleEdit = (user: any) => {
    setEditingId(user.id)
    setNewName(user.name || "")
    setNewEmail(user.email)
    setNewPassword("") 
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        if (editingId) {
            await updateUser({ 
                id: editingId, 
                data: { name: newName, email: newEmail, password: newPassword } 
            })
        } else {
            await createUser({ name: newName, email: newEmail, password: newPassword })
        }
        resetForm()
    } catch (error) {
        alert("Erro ao salvar utilizador")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await deleteUser(id)
    }
  }

  const isLoading = loadingCreate || loadingUpdate;
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      
      <SideBar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Utilizadores</h1>
            <p className="text-muted-foreground mt-1">Administre quem tem acesso ao sistema.</p>
          </div>

          {/* MODAL */}
          <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Utilizador
                </Button>
            </DialogTrigger>
            {/* MUDANÇA: Remove bg-slate-900 fixo, deixa o DialogContent padrão lidar com o tema */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Utilizador" : "Criar Utilizador"}</DialogTitle>
                    <DialogDescription>
                        {editingId ? "Altere os dados abaixo." : "Adicione um novo administrador ao sistema."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            required={!editingId} 
                            minLength={6}
                            placeholder={editingId ? "(Não alterar)" : ""}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Salvando..." : (editingId ? "Atualizar" : "Criar")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* MUDANÇA: bg-card em vez de bg-slate-900 */}
        <Card className="bg-card">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right pr-6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingList ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Carregando utilizadores...</TableCell>
                            </TableRow>
                        ) : users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium pl-6">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar com cor primária do tema */}
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary font-bold text-xs">
                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        {user.name || "Sem nome"}
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleEdit(user)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={loadingDelete}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
