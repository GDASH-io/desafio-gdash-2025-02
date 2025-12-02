import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/ToastContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users", { headers });
      setUsers(data);
    } catch (err) {
      toast({ type: "error", message: "Erro ao carregar usuários." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const submit = async () => {
    if (!form.name || !form.email || (!editUser && !form.password)) {
      return toast({ type: "error", message: "Preencha todos os campos!" });
    }

    try {
      setSaving(true);

      if (editUser) {
        await api.put(`/users/${editUser._id}`, form, { headers });
        toast({ type: "success", message: "Usuário atualizado com sucesso!" });
      } else {
        await api.post("/users", form, { headers });
        toast({ type: "success", message: "Usuário criado com sucesso!" });
      }

      setOpen(false);
      setEditUser(null);
      setForm({ name: "", email: "", password: "", role: "user" });
      loadUsers();
    } catch {
      toast({ type: "error", message: "Erro ao salvar usuário." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    try {
      await api.delete(`/users/${id}`, { headers });
      toast({ type: "success", message: "Usuário removido!" });
      loadUsers();
    } catch {
      toast({ type: "error", message: "Erro ao remover usuário." });
    }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: "", email: "", password: "", role: "user" });
    setOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 md:gap-0">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-slate-700 hover:bg-slate-600 text-white shadow-md transition w-full sm:w-auto"
          >
            Voltar ao Dashboard
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">
            Gerenciar Usuários
          </h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md transition w-full sm:w-auto"
            >
              Novo usuário
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-slate-900 text-white border border-amber-300/30 rounded-2xl shadow-xl w-[95%] sm:w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editUser ? "Editar Usuário" : "Criar Usuário"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-4">
              <Input
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 text-white"
              />

              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-slate-800 text-white"
              />

              <Input
                placeholder="Senha"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-slate-800 text-white"
              />

              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="bg-slate-800 text-white p-2 rounded-md shadow-inner"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <Button
                onClick={submit}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md transition"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABELA RESPONSIVA */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-slate-800 border border-slate-700">
        {loading ? (
          <p className="p-6 text-center text-gray-300">
            Carregando usuários...
          </p>
        ) : (
          <Table className="min-w-full text-white text-sm sm:text-base">
            <TableHeader className="bg-slate-700">
              <TableRow>
                <TableHead className="p-3 whitespace-nowrap">Nome</TableHead>
                <TableHead className="p-3 whitespace-nowrap">Email</TableHead>
                <TableHead className="p-3 whitespace-nowrap">Papel</TableHead>
                <TableHead className="p-3 whitespace-nowrap text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((u) => (
                <TableRow
                  key={u._id}
                  className="hover:bg-slate-700 transition-all"
                >
                  <TableCell className="p-3">{u.name}</TableCell>
                  <TableCell className="p-3">{u.email}</TableCell>
                  <TableCell className="p-3 capitalize">{u.role}</TableCell>
                  <TableCell className="flex flex-col sm:flex-row gap-2 p-3 justify-center">
                    <Button
                      size="sm"
                      onClick={() => openEdit(u)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-900 w-full sm:w-auto"
                    >
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(u._id)}
                      className="w-full sm:w-auto"
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
