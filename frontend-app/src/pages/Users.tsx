import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from "react"
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/useUsers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog"
import { 
    LayoutDashboard, User, LogOut, Plus, Trash2, CloudSun 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const Users = () => {
    const navigate = useNavigate()
  const { users, loading: loadingList } = useUsers()
  const { createUser, loading: loadingCreate } = useCreateUser()
  const { deleteUser, loading: loadingDelete } = useDeleteUser()

  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const handleLogout = () => {
    localStorage.removeItem('gdash_token')
    navigate({ to: '/auth/login' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        await createUser({ name: newName, email: newEmail, password: newPassword })
        setIsOpen(false) // Fecha modal
        setNewName(""); setNewEmail(""); setNewPassword(""); // Limpa form
    } catch (error) {
        alert("Erro ao criar usuário")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
        await deleteUser(id)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      
      {/* --- SIDEBAR (Mesma do Dashboard) --- */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CloudSun className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">GDASH</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-slate-100" onClick={() => navigate({ to: '/dashboard' })}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start bg-slate-800 text-blue-400 hover:bg-slate-800 hover:text-blue-400">
            <User className="mr-2 h-4 w-4" /> Usuários
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
            <p className="text-slate-400 mt-1">Administre quem tem acesso ao sistema.</p>
          </div>

          {/* MODAL DE CRIAÇÃO */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Usuário</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Adicione um novo administrador ao sistema.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-slate-950 border-slate-800" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-slate-950 border-slate-800" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-slate-950 border-slate-800" required minLength={6} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loadingCreate} className="bg-blue-600 hover:bg-blue-700 w-full">
                            {loadingCreate ? "Salvando..." : "Criar Usuário"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABELA DE USUÁRIOS */}
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
                        {loadingList ? (
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
                                        onClick={() => handleDelete(user.id)}
                                        disabled={loadingDelete}
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
      </main>
    </div>
  )
}