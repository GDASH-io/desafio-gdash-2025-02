import { useEffect, useState } from "react";
import { api } from "../services/api";
import { User } from "../types";
import { UserForm } from "../components/users/UserForm";
import { XIcon, ShieldAlertIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Bloqueio de acesso para não-admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
            <ShieldAlertIcon className="h-8 w-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Acesso Restrito
          </h1>
          <p className="text-white/70">
            Apenas administradores podem gerenciar usuários.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get<User[]>("/api/users");
      setUsers(data);
    } catch {
      setError("Erro ao carregar usuários");
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente remover este usuário?")) return;

    try {
      await api.delete(`/api/users/${id}`);
      setSuccess("Usuário removido com sucesso");
      setTimeout(() => setSuccess(""), 3000);
      loadUsers();
    } catch {
      setError("Erro ao remover usuário");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSubmit = async (data: Partial<User>) => {
    try {
      if (editingUser?._id) {
        await api.put(`/api/users/${editingUser._id}`, data);
        setSuccess("Usuário atualizado com sucesso");
      } else {
        await api.post("/api/users", data);
        setSuccess("Usuário criado com sucesso");
      }
      setTimeout(() => setSuccess(""), 3000);
      setDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao salvar usuário");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho com título e botão */}
      <div className="flex items-center justify-between">
        <img
          src="/assets/02_0015_Gerenciar-Usuários.png"
          alt="Gerenciar Usuários"
          className="h-8"
        />
        
        {/* BOTÃO COM FUNDO E TEXTO */}
        <button
          onClick={handleCreate}
          className="relative hover:opacity-80 transition-opacity"
          style={{
            width: "160px",
            height: "40px",
            backgroundImage: `url(/assets/02_0018_BOTÃO-USUÁRIO.png)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="text-white text-sm font-semibold">
            + Novo Usuário
          </span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200">
          {success}
        </div>
      )}

      {/* Container com box cinza de fundo */}
      <div
        className="relative rounded-lg overflow-hidden min-h-[600px]"
        style={{
          backgroundImage: `url(/assets/02_0027_GRAY.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Header da tabela */}
        <div
          className="relative h-12 flex items-center px-8"
          style={{
            backgroundImage: `url(/assets/02_0026_BARRA.png)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex-1">
            <img
              src="/assets/02_0008_NOME.png"
              alt="Nome"
              className="h-3"
            />
          </div>
          <div className="flex-1">
            <img
              src="/assets/02_0007_EMAIL.png"
              alt="Email"
              className="h-3"
            />
          </div>
          <div className="w-32">
            <img
              src="/assets/02_0006_ROLE.png"
              alt="Role"
              className="h-3"
            />
          </div>
          <div className="w-24 flex justify-end">
            <img
              src="/assets/02_0005_AÇÕES.png"
              alt="Ações"
              className="h-4"
            />
          </div>
        </div>

        {/* Conteúdo da tabela */}
        <div className="pb-6">
          {users.map((user, index) => (
            <div key={user._id}>
              {/* Linha do usuário */}
              <div className="relative h-14 flex items-center px-8">
                <div className="flex-1 text-slate-800 text-sm font-medium">
                  {user.email?.split("@")[0] || "N/A"}
                </div>
                <div className="flex-1 text-slate-800 text-sm font-medium">
                  {user.email}
                </div>
                <div className="w-32 text-slate-900 text-sm font-bold">
                  {user.role}
                </div>
                <div className="w-24 flex items-center justify-end gap-3">
                  {/* Botão Editar */}
                  <button
                    onClick={() => handleEdit(user)}
                    className="hover:opacity-70 transition-opacity"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <img
                      src="/assets/02_0004_EDIT.png"
                      alt="Editar"
                      className="w-full h-full object-contain"
                    />
                  </button>

                  {/* Botão Deletar */}
                  <button
                    onClick={() => handleDelete(user._id!)}
                    className="hover:opacity-70 transition-opacity"
                    style={{ width: "20x", height: "20px" }}
                  >
                    <img
                      src="/assets/02_0003_TRASH.png"
                      alt="Deletar"
                      className="w-full h-full object-contain"
                    />
                  </button>
                </div>
              </div>

              {/* Linha separadora - CENTRALIZADA E COM LARGURA CONTROLADA */}
              {index < users.length - 1 && (
                <div className="flex justify-center px-8 py-2">
                  <div
                    className="h-[1px]"
                    style={{
                      width: "97%",
                      backgroundImage: `url(/assets/02_0025_LINHA.png)`,
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Mensagem se não houver usuários */}
          {users.length === 0 && (
            <div className="text-center py-12 text-slate-600 font-medium">
              Nenhum usuário cadastrado
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </h2>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <UserForm
                user={editingUser}
                onSubmit={handleSubmit}
                onCancel={() => setDialogOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
