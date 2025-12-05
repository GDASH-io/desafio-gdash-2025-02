import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { SidebarLayout } from "../components/Sidebar";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 🔑 NOVO
  const [role, setRole] = useState<"admin" | "user">("user");

  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  async function loadUsers() {
    const headers = getAuthHeaders();
    if (!headers) return navigate("/");

    try {
      const res = await api.get<User[]>("/users", { headers });
      setUsers(res.data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // ➕ Abrir modal para criar
  function openCreateModal() {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword(""); // limpar senha
    setRole("user");
    setIsModalOpen(true);
  }

  // ✏️ Abrir modal para editar
  function openEditModal(user: User) {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // senha em branco = manter
    setRole((user.role as "admin" | "user") || "user");
    setIsModalOpen(true);
  }

  // 💾 Salvar (criar ou editar)
  async function handleSave() {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (!name.trim() || !email.trim()) {
      alert("Nome e e-mail são obrigatórios.");
      return;
    }

    try {
      if (editingUser) {
        // EDITAR
        const body: any = {
          name,
          email,
          role,
        };

        // Só envia password se usuário digitou algo
        if (password.trim()) {
          body.password = password;
        }

        await api.patch(`/users/${editingUser._id}`, body, { headers });
      } else {
        // CRIAR
        if (!password.trim()) {
          alert("Senha é obrigatória para novo usuário.");
          return;
        }

        await api.post(
          "/users",
          {
            name,
            email,
            password,
            role,
          },
          { headers },
        );
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      alert("Erro ao salvar usuário.");
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await api.delete(`/users/${id}`, { headers });
      await loadUsers();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      alert("Erro ao excluir usuário.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Carregando usuários...
      </div>
    );
  }

  return (

<SidebarLayout>
      <header className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500"
        >
          Novo usuário
        </button>
      </header>

      {/* Tabela */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-2">Nome</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Perfil</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-800">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.email}</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700">
                    {u.role || "user"}
                  </span>
                </td>
                <td className="flex gap-3 py-2 justify-center">
                  <button
                    onClick={() => openEditModal(u)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 w-96">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? "Editar usuário" : "Novo usuário"}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder={
                  editingUser
                    ? "Senha (preencha para alterar)"
                    : "Senha (obrigatória)"
                }
                className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Perfil</span>
                <select
                  className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "user")}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500 text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
  </SidebarLayout>

    
  );
}
