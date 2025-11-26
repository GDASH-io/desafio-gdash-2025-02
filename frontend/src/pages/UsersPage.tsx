import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });

  // Função auxiliar para recarregar a lista (usada pelos botões)
  const refreshList = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
    }
  };

  // --- CORREÇÃO AQUI: Definindo a busca inicial DENTRO do efeito ---
  useEffect(() => {
    let isMounted = true; // Flag para evitar erro se a tela fechar rápido

    const loadInitialData = async () => {
      try {
        const res = await api.get("/users");
        if (isMounted) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    loadInitialData();

    // Função de limpeza
    return () => {
      isMounted = false;
    };
  }, []); // Dependências vazias: roda apenas uma vez na montagem

  // --- Funções de Ação ---

  const createUser = async () => {
    if (!newUser.username || !newUser.password) return;
    try {
      await api.post("/users", newUser);
      setNewUser({ username: "", password: "" });
      refreshList(); // Chama a auxiliar
    } catch (error) {
      alert("Erro ao criar usuário");
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm("Tem certeza que deseja remover?")) {
      try {
        await api.delete(`/users/${id}`);
        refreshList(); // Chama a auxiliar
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  const editUser = async (user: any) => {
    const newUsername = prompt("Novo nome de usuário:", user.username);

    // Se digitou algo e é diferente do atual
    if (newUsername && newUsername !== user.username) {
      try {
        // Chama o Backend
        await api.put(`/users/${user._id}`, { username: newUsername });
        // Atualiza a lista na tela
        refreshList();
      } catch (error) {
        alert("Erro ao editar (Verifique se o Backend subiu a alteração)");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            👥 Gerenciar Usuários
          </h1>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Voltar ao Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Cadastrar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
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
            <Button onClick={createUser}>Criar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editUser(u)}
                      >
                        Editar
                      </Button>
                      {u.username !== "admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(u._id)}
                        >
                          Remover
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
