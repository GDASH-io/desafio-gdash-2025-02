import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

export const UsersPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });

  // Carregar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Erro ao criar usuário');
      }

      await fetchUsers();
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    try {
      const response = await fetch(`/api/users/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Erro ao atualizar usuário');
      }

      await fetchUsers();
      setFormData({ name: '', email: '', password: '' });
      setEditingId(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar usuário');
      }

      await fetchUsers();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, password: '' });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Gerenciar Usuários</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Novo Usuário Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', email: '', password: '' });
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Usuário'}
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-8 p-6 backdrop-blur-sm bg-white/10 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={editingId ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  {editingId ? 'Senha (deixe em branco para não alterar)' : 'Senha'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required={!editingId}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </form>
          </Card>
        )}

        {/* Tabela de Usuários */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : users.length === 0 ? (
          <Card className="p-6 backdrop-blur-sm bg-white/10 border border-white/20 text-center">
            <p className="text-white/60">Nenhum usuário encontrado</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Nome</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Criado em</th>
                  <th className="px-6 py-4 text-center text-white/80 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white">{user.name}</td>
                    <td className="px-6 py-4 text-white/70">{user.email}</td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-200 rounded hover:bg-blue-500/30 transition text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-200 rounded hover:bg-red-500/30 transition text-sm"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
