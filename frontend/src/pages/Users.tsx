import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { getUsers, createUser, updateUser, deleteUser, changePassword, User, getCurrentUser } from '../services/api'
import { useToast } from '../hooks/use-toast'

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' })
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' })
  const { toast } = useToast()

  // Verificar se o usuário é admin
  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description: 'Apenas administradores podem acessar esta página.',
        variant: 'destructive',
      })
      navigate('/dashboard')
    }
  }, [navigate, toast])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar usuários',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({ name: user.name, email: user.email, password: '', role: user.role || 'user' })
    } else {
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'user' })
    }
    setDialogOpen(true)
  }

  const handleOpenPasswordDialog = (user: User) => {
    setEditingUser(user)
    setPasswordData({ password: '', confirmPassword: '' })
    setPasswordDialogOpen(true)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      })
      return
    }

    if (!editingUser) return

    try {
      await changePassword(editingUser.id || editingUser._id || '', passwordData.password)
      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!',
      })
      setPasswordDialogOpen(false)
      setPasswordData({ password: '', confirmPassword: '' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao alterar senha',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Remover senha do formData ao atualizar
        const { password, ...updateData } = formData
        await updateUser(editingUser.id || editingUser._id || '', updateData)
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso!',
        })
      } else {
        await createUser(formData)
        toast({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso!',
        })
      }
      setDialogOpen(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar usuário',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => (u.id || u._id) === id)
    
    // Verificar se é o último admin
    const adminUsers = users.filter(u => u.role === 'admin')
    if (userToDelete?.role === 'admin' && adminUsers.length <= 1) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir o último administrador do sistema.',
        variant: 'destructive',
      })
      return
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await deleteUser(id)
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso!',
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir usuário',
        variant: 'destructive',
      })
    }
  }

  const user = getCurrentUser()
  const isAdmin = user?.role === 'admin'
  
  // Não renderizar se não for admin
  if (!isAdmin) {
    return null
  }

  // Contar quantos admins existem
  const adminCount = users.filter(u => u.role === 'admin').length
  const isLastAdmin = (userId: string) => {
    const targetUser = users.find(u => (u.id || u._id) === userId)
    return targetUser?.role === 'admin' && adminCount <= 1
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={6}
                      required
                    />
                  </div>
                )}
                {editingUser && (
                  <div className="grid gap-2">
                    <Label>Alterar Senha</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false)
                        handleOpenPasswordDialog(editingUser)
                      }}
                    >
                      Alterar Senha
                    </Button>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={editingUser ? (editingUser.role === 'admin' && adminCount <= 1) : false}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                  {editingUser && editingUser.role === 'admin' && adminCount <= 1 && (
                    <p className="text-xs text-muted-foreground">
                      Não é possível alterar a função do último administrador
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingUser ? 'Atualizar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para alterar senha */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <form onSubmit={handleChangePassword}>
              <DialogHeader>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogDescription>
                  Digite a nova senha para {editingUser?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Alterar Senha</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id || user._id} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.role || 'user'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(user)}
                      className="mr-2"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id || user._id || '')}
                      disabled={isLastAdmin(user.id || user._id || '')}
                      title={isLastAdmin(user.id || user._id || '') ? 'Não é possível excluir o último administrador' : ''}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

