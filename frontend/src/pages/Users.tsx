import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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
import { usersService, User, UpdateUserDto } from "@/services/users";
import { authService } from "@/services/auth";
import { Trash2, Save, User as UserIcon } from "lucide-react";

export function Users() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<UpdateUserDto>({
    name: "",
    email: "",
    password: "",
  });

  const user = authService.getUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, currentUserData] = await Promise.all([
        usersService.getAllUsers(),
        usersService.getCurrentUser(),
      ]);
      setAllUsers(usersData);
      setCurrentUser(currentUserData);
      setEditForm({
        name: currentUserData.name || "",
        email: currentUserData.email || "",
        password: "",
      });
    } catch (err: any) {
      setError("Erro ao carregar dados dos usuários");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateUserDto = {};
      if (editForm.name && editForm.name !== currentUser?.name) {
        updateData.name = editForm.name;
      }
      if (editForm.email && editForm.email !== currentUser?.email) {
        updateData.email = editForm.email;
      }
      if (editForm.password && editForm.password.length > 0) {
        updateData.password = editForm.password;
      }

      if (Object.keys(updateData).length === 0) {
        setError("Nenhuma alteração foi feita");
        setSaving(false);
        return;
      }

      const updatedUser = await usersService.updateCurrentUser(updateData);
      setCurrentUser(updatedUser);
      setSuccess("Perfil atualizado com sucesso!");
      
      if (updatedUser.id || updatedUser._id) {
        const userData = {
          id: updatedUser.id || updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setEditForm((prev) => ({ ...prev, password: "" }));
      
      await loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erro ao atualizar perfil"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await usersService.deleteCurrentUser();
      authService.logout();
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao excluir conta");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Gerenciamento de Usuários
          </h2>
          <p className="text-gray-600">
            Gerencie seu perfil e visualize todos os usuários do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Meu Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome
                  </label>
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nova Senha (deixe em branco para não alterar)
                  </label>
                  <Input
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                    {success}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Excluindo..." : "Excluir Conta"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Dados da sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser && (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      ID:
                    </span>
                    <p className="text-sm">{currentUser._id || currentUser.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Email:
                    </span>
                    <p className="text-sm">{currentUser.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Nome:
                    </span>
                    <p className="text-sm">{currentUser.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Status:
                    </span>
                    <p className="text-sm">
                      {currentUser.isActive ? (
                        <span className="text-green-600">Ativo</span>
                      ) : (
                        <span className="text-red-600">Inativo</span>
                      )}
                    </p>
                  </div>
                  {currentUser.createdAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Criado em:
                      </span>
                      <p className="text-sm">
                        {new Date(currentUser.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Usuários</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum usuário encontrado
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user._id || user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <span className="text-green-600">Ativo</span>
                        ) : (
                          <span className="text-red-600">Inativo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

