import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'

// Constantes
const DEFAULT_FORM_DATA = {
  name: '',
  email: '',
  password: '',
  role: 'user' as const
}

// Ícones simples
const PlusIcon = () => <span>+</span>
const EditIcon = () => <span>✏️</span>
const TrashIcon = () => <span>🗑️</span>
const SearchIcon = () => <span>🔍</span>

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}

export function UsersPage() {
  const { user } = useAuth()

  // only admins can access this page — redirect / show message for others
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Acesso negado</h2>
        <p className="text-muted-foreground mt-2">Você não tem permissão para ver esta seção.</p>
      </div>
    )
  }
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserData>(DEFAULT_FORM_DATA)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/api/users')
      console.debug('Users fetch response:', response.data)
      if (!Array.isArray(response.data)) {
        setError('Resposta inesperada da API')
        setUsers([])
      } else {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      // keep a human-friendly error message in the UI
      setError((error as any)?.response?.data?.message || (error as any)?.message || 'Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async () => {
    try {
      await api.post('/api/users', formData)
      setIsCreateModalOpen(false)
      setFormData({ name: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    
    try {
      const updateData = { 
        name: formData.name, 
        email: formData.email, 
        role: formData.role 
      }
      await api.patch(`/api/users/${selectedUser._id}`, updateData)
      setIsEditModalOpen(false)
      setSelectedUser(null)
      setFormData({ name: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } catch (error) {
      console.error('Erro ao editar usuário:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    try {
      await api.delete(`/api/users/${userId}`)
      fetchUsers()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setIsEditModalOpen(true)
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">


      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Gerencie usuários do sistema</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              <span className="ml-2">Novo Usuário</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite o e-mail"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a senha"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <select
                  id="role"
                  className="w-full p-2 border rounded-md"
                  value={formData.role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>
                  Criar Usuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <SearchIcon />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Debug info: show current user & errors */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Usuário atual: <strong>{user?.name || 'desconhecido'}</strong> — role: <strong>{user?.role || '—'}</strong></div>
        {error && (
          <div className="mt-2 p-3 rounded bg-red-50 border border-red-200 text-red-700">Erro: {error}</div>
        )}
      </div>

      {/* Lista de usuários */}
      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Nome</th>
                <th className="text-left p-4 font-medium">E-mail</th>
                <th className="text-left p-4 font-medium">Função</th>
                <th className="text-left p-4 font-medium">Criado em</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    Carregando...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Digite o e-mail"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Função</Label>
              <select
                id="edit-role"
                className="w-full p-2 border rounded-md"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedUser(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditUser}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}