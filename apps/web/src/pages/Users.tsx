import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  LayoutDashboard, 
  Plus, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Shield, 
  Crown, 
  Pencil, 
  Trash2, 
  Save, 
  X,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { authService } from '../lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' as 'admin' | 'user' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get<User[]>('/users');
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/users/${editingId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setEditingId(null);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-gray-600 font-medium">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-700 rounded-3xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
                <p className="text-gray-400 text-sm">{users.length} usuários cadastrados</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-600 text-white rounded-xl transition font-medium flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ name: '', email: '', password: '', role: 'user' });
                }}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-gray-700 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                {editingId ? <Pencil className="w-5 h-5 text-gray-800" /> : <Plus className="w-5 h-5 text-gray-800" />}
              </div>
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <UserIcon className="w-4 h-4" />
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Lock className="w-4 h-4" />
                  Senha {editingId && <span className="text-gray-500">(deixe vazio para manter)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Shield className="w-4 h-4" />
                  Papel
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', email: '', password: '', role: 'user' });
                  }}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-600 text-white rounded-xl transition font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-700 rounded-3xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}>
                    {user.role === 'admin' ? (
                      <Crown className="w-6 h-6 text-gray-800" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  user.role === 'admin' 
                    ? 'bg-yellow-400/20 text-yellow-400' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {user.role === 'admin' ? (
                    <>
                      <Crown className="w-3 h-3" />
                      Admin
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-3 h-3" />
                      Usuário
                    </>
                  )}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 bg-gray-700 rounded-3xl p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-400">Clique em "Novo Usuário" para adicionar o primeiro.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Weather Dashboard • GDASH Challenge 2025</p>
        </footer>
      </div>
    </div>
  );
}
