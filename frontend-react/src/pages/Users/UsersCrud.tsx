import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import api from '../../app/api';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
}

export default function UsersCrud() {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

  // Helper para obter o ID do usuário (suporta tanto id quanto _id)
  const getUserId = (user: User): string => {
    return user.id || user._id || '';
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      // A resposta pode vir como array direto ou como objeto com data
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      // Normalizar IDs: garantir que todos os usuários tenham 'id'
      const normalizedData = data.map((u: any) => ({
        ...u,
        id: u.id || u._id,
      }));
      setUsers(normalizedData);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      showToast('Erro ao carregar usuários. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const userId = getUserId(editingUser);
        if (!userId) {
          showToast('ID do usuário inválido', 'error');
          return;
        }
        await api.put(`/users/${userId}`, formData);
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        await api.post('/users', formData);
        showToast('Usuário criado com sucesso!', 'success');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar usuário';
      showToast(errorMessage, 'error');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    const userId = getUserId(userToDelete);
    if (!userId) {
      showToast('ID do usuário inválido', 'error');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      showToast('Usuário excluído com sucesso!', 'success');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Erro ao excluir usuário';
      showToast(errorMessage, 'error');
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Acesso negado. Apenas administradores.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Criar, editar e excluir usuários</p>
          </div>
          <Button onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            setShowModal(true);
          }}>
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-secondary rounded text-xs">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(u)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(u)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setEditingUser(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
            </p>
            <p className="text-sm text-red-600 font-medium">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setUserToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Excluir
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </Layout>
  );
}


