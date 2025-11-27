import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import {
  ArrowLeft,
  Pencil,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });

  // Função auxiliar para recarregar a lista
  const refreshList = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Busca inicial
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const res = await api.get("/users");
      if (isMounted) setUsers(res.data);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const createUser = async () => {
    if (!newUser.username || !newUser.password) return;
    try {
      await api.post("/users", newUser);
      setNewUser({ username: "", password: "" });
      refreshList();
    } catch (error) {
      alert("Erro ao criar usuário");
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm("Tem certeza que deseja remover?")) {
      try {
        await api.delete(`/users/${id}`);
        refreshList();
      } catch (e) {
        alert("Erro ao deletar");
      }
    }
  };

  const editUser = async (user: any) => {
    const newUsername = prompt("Novo nome de usuário:", user.username);
    if (newUsername && newUsername !== user.username) {
      try {
        await api.put(`/users/${user._id}`, { username: newUsername });
        refreshList();
      } catch (e) {
        alert("Erro ao editar");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <Users className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Gerenciar Usuários
              </h1>
              <p className="text-sm text-slate-500">
                Controle de acesso ao sistema
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Coluna 1: Criar */}
          <Card className="md:col-span-1 h-fit shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-blue-600" /> Novo Usuário
              </CardTitle>
              <CardDescription>Adicione um novo administrador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nome de usuário"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Senha"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <Button onClick={createUser} className="w-full">
                Cadastrar
              </Button>
            </CardContent>
          </Card>

          {/* Coluna 2: Listar */}
          <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {u.username === "admin" && (
                          <ShieldAlert className="w-4 h-4 text-yellow-600" />
                        )}
                        {u.username}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editUser(u)}
                          >
                            <Pencil className="w-4 h-4 text-slate-600" />
                          </Button>
                          {u.username !== "admin" && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                              onClick={() => deleteUser(u._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
