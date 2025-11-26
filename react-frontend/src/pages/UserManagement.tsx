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

interface User {
  _id: string;
  email: string;
  roles: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function UserManagement() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ email: '', password: '', roles: 'user' });

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/users`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUserData({ email: '', password: '', roles: 'user' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.');
      console.error(err);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/users/${currentUser._id}`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user.');
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      console.error(err);
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

  if (loading) return <p className="text-[#E5E7EB]">Carregando usuários...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;
  if (!token) return <p className="text-[#E5E7EB]">Por favor, faça login para gerenciar usuários.</p>;
  if (user?.roles !== 'admin') return <p className="text-[#E5E7EB]">Você não tem permissão para visualizar esta página.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#E5E7EB]">Gerenciamento de Usuários</h2>

      {/* Create User Form */}
      <Card className="bg-[#161B22] border-[#1F2937]">
        <CardHeader>
          <CardTitle className="text-[#E5E7EB]">Criar Novo Usuário</CardTitle>
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
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, password: e.target.value })}
                required
                className="bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-roles" className="text-[#E5E7EB]">Funções</Label>
              <select
                id="new-roles"
                className="flex h-10 w-full rounded-md border border-[#1F2937] bg-[#0D1117] px-3 py-2 text-sm text-[#E5E7EB] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUserData.roles}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserData({ ...newUserData, roles: e.target.value })}
              >
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="md:col-span-3">Adicionar Usuário</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-[#E5E7EB]">Usuários Existentes</h3>
        <div className="rounded-lg border border-[#1F2937] bg-[#161B22] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
                <TableHead className="text-[#E5E7EB]">Email</TableHead>
                <TableHead className="text-[#E5E7EB]">Roles</TableHead>
                <TableHead className="text-right text-[#E5E7EB]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem._id} className="border-[#1F2937] hover:bg-[#1F2937]/50">
                  <TableCell className="text-[#E5E7EB]">{userItem.email}</TableCell>
                  <TableCell className="text-[#E5E7EB]">{userItem.roles}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(userItem)} className="mr-2">Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(userItem)}>Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#161B22] border-[#1F2937]">
          <DialogHeader>
            <DialogTitle className="text-[#E5E7EB]">Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right text-[#E5E7EB]">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newUserData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="col-span-3 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right text-[#E5E7EB]">Nova Senha (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="col-span-3 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-roles" className="text-right text-[#E5E7EB]">Funções</Label>
              <select
                id="edit-roles"
                className="col-span-3 flex h-10 w-full rounded-md border border-[#1F2937] bg-[#0D1117] px-3 py-2 text-sm text-[#E5E7EB] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUserData.roles}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserData({ ...newUserData, roles: e.target.value })}
              >
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#161B22] border-[#1F2937]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E5E7EB]">Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#9CA3AF]">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário <span className="font-bold text-[#E5E7EB]">{currentUser?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
