import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '../auth/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Edit, Trash2, Loader2, Shield, ShieldCheck, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface User {
  _id: string;
  email: string;
  roles: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Página de gerenciamento de usuários - disponível apenas para administradores
export function UserManagement() {
  const { token, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ email: '', password: '', roles: 'user' });
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Carrega lista de usuários apenas se o usuário atual for admin
  useEffect(() => {
    if (token && user?.roles === 'admin') {
      fetchUsers();
    }
  }, [token, user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: err.response?.data?.message || 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUserData({ email: '', password: '', roles: 'user' });
      toast({
        title: 'Usuário criado com sucesso!',
        description: `O usuário ${newUserData.email} foi criado.`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: err.response?.data?.message || 'Não foi possível criar o usuário.',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      // Só envia senha se o campo não estiver vazio (permite atualizar sem mudar senha)
      const updateData: any = { email: newUserData.email, roles: newUserData.roles };
      if (newUserData.password) {
        updateData.password = newUserData.password;
      }
      await axios.put(`${API_BASE_URL}/api/users/${currentUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditDialogOpen(false);
      toast({
        title: 'Usuário atualizado!',
        description: `Os dados do usuário foram atualizados com sucesso.`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: err.response?.data?.message || 'Não foi possível atualizar o usuário.',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Usuário excluído!',
        description: `O usuário ${currentUser.email} foi removido do sistema.`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir usuário',
        description: err.response?.data?.message || 'Não foi possível excluir o usuário.',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setNewUserData({ email: user.email, password: '', roles: user.roles });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roles !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#161B22] border border-[#1F2937]">
            <Users className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#E5E7EB]">Gerenciamento de Usuários</h2>
            <p className="text-sm text-[#9CA3AF] mt-1">Gerencie usuários e permissões do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#1F2937]">
          <ShieldCheck className="h-4 w-4 text-[#3B82F6]" />
          <span className="text-sm text-[#E5E7EB]">Acesso Admin</span>
        </div>
      </div>

      <Card className="bg-[#161B22] border-[#1F2937]">
        <CardHeader>
          <CardTitle className="text-[#E5E7EB] flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#3B82F6]" />
            Criar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-email" className="text-[#E5E7EB]">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@example.com"
                value={newUserData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
                className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password" className="text-[#E5E7EB]">Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, password: e.target.value })}
                required
                minLength={6}
                className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-roles" className="text-[#E5E7EB]">Função</Label>
              <Select value={newUserData.roles} onValueChange={(value) => setNewUserData({ ...newUserData, roles: value })}>
                <SelectTrigger className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB]">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-[#1F2937]">
                  <SelectItem value="user" className="text-[#E5E7EB] focus:bg-[#1F2937]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Usuário
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-[#E5E7EB] focus:bg-[#1F2937]">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-3" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#161B22] border-[#1F2937]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-[#E5E7EB] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#3B82F6]" />
              Usuários Existentes ({users.length})
            </CardTitle>
            <div className="relative w-full md:w-auto md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                type="text"
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : (() => {
            // Filtra usuários por email (busca case-insensitive)
            const filteredUsers = users.filter(user => 
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filteredUsers.length === 0) {
              return (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                  <p className="text-[#9CA3AF]">
                    {searchTerm ? 'Nenhum usuário encontrado com esse email' : 'Nenhum usuário encontrado'}
                  </p>
                </div>
              );
            }
            
            return (
              <div className="rounded-lg border border-[#1F2937] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
                      <TableHead className="text-[#E5E7EB]">Email</TableHead>
                      <TableHead className="text-[#E5E7EB]">Função</TableHead>
                      <TableHead className="text-right text-[#E5E7EB]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => (
                    <TableRow key={userItem._id} className="border-[#1F2937] hover:bg-[#1F2937]/50">
                      <TableCell className="text-[#E5E7EB]">{userItem.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {userItem.roles === 'admin' ? (
                            <>
                              <Shield className="h-4 w-4 text-[#3B82F6]" />
                              <span className="text-[#3B82F6] font-medium">Administrador</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 text-[#9CA3AF]" />
                              <span className="text-[#9CA3AF]">Usuário</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(userItem)}
                            className="border-[#1F2937] text-[#E5E7EB] hover:bg-[#1F2937]"
                            disabled={isSubmitting}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => openDeleteDialog(userItem)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            );
          })()}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#161B22] border-[#1F2937]">
          <DialogHeader>
            <DialogTitle className="text-[#E5E7EB] flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#3B82F6]" />
              Editar Usuário
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-[#E5E7EB]">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newUserData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password" className="text-[#E5E7EB]">Nova Senha (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Deixe em branco para manter a senha atual"
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
                minLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-roles" className="text-[#E5E7EB]">Função</Label>
              <Select value={newUserData.roles} onValueChange={(value) => setNewUserData({ ...newUserData, roles: value })}>
                <SelectTrigger className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB]">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-[#1F2937]">
                  <SelectItem value="user" className="text-[#E5E7EB] focus:bg-[#1F2937]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Usuário
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-[#E5E7EB] focus:bg-[#1F2937]">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#161B22] border-[#1F2937]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E5E7EB] flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#9CA3AF]">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário{' '}
              <span className="font-bold text-[#E5E7EB]">{currentUser?.email}</span> do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir permanentemente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
