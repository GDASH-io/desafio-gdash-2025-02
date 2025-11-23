import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Loader2, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createUser,
  deleteUser,
  getUserProfile,
  getUsers,
  updateUser,
  type UserProfile,
} from "../services/api";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";

export function UsersDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersList, me] = await Promise.all([getUsers(), getUserProfile()]);
      setUsers(usersList);
      setCurrentUser(me);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.email === "admin@example.com";

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      await createUser(newUserData);
      alert("Usuário criado com sucesso!");
      setIsCreateOpen(false);
      setNewUserData({ name: "", email: "", password: "" });
      loadData();
    } catch (error: any) {
      if (error.response?.status === 409) alert("Email já existe.");
      else alert("Erro ao criar usuário.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      await updateUser({ name: newName });
      alert("Seu perfil foi atualizado!");
      setIsEditOpen(false);
      loadData();
    } catch (error) {
      alert("Erro ao atualizar.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "⚠️ PERIGO: Deletar sua própria conta irá deslogar você. Continuar?"
      )
    ) {
      try {
        await deleteUser();
        window.location.href = "/";
      } catch (error) {
        alert("Erro ao deletar.");
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dashboard-bg text-dashboard-text font-sans selection:bg-dashboard-highlight selection:text-white">
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      <main className="flex-1 p-4 md:p-8 pb-20 space-y-6 md:space-y-8 overflow-y-auto w-full">
        <DashboardHeader
          title="Gestão de Usuários"
          subtitle="Administração de contas e permissões"
        />

        <div className="bg-dashboard-card rounded-[2rem] border border-white/5 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-dashboard-highlight" /> Lista de
              Usuários
            </h2>

            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-dashboard-highlight text-dashboard-card font-bold hover:bg-dashboard-highlight/90">
                    <Plus className="h-4 w-4 mr-2" /> Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dashboard-card border-white/10 text-white sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription className="text-dashboard-muted">
                      Crie uma conta para um novo membro da equipe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input
                        value={newUserData.name}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            name: e.target.value,
                          })
                        }
                        className="bg-dashboard-bg border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Corporativo</Label>
                      <Input
                        type="email"
                        value={newUserData.email}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            email: e.target.value,
                          })
                        }
                        className="bg-dashboard-bg border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha Inicial</Label>
                      <Input
                        type="password"
                        value={newUserData.password}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            password: e.target.value,
                          })
                        }
                        className="bg-dashboard-bg border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={actionLoading}
                    className="w-full bg-dashboard-highlight text-dashboard-card font-bold"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Criar Usuário"
                    )}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="rounded-xl border border-white/5 overflow-hidden bg-dashboard-bg/30">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableHead className="text-dashboard-muted font-bold">
                    Nome
                  </TableHead>
                  <TableHead className="text-dashboard-muted font-bold">
                    Email
                  </TableHead>
                  <TableHead className="text-right text-dashboard-muted font-bold">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        <TableCell>
                          <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 bg-white/10 rounded animate-pulse ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : users.map((user) => (
                      <TableRow
                        key={user._id}
                        className="border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="font-medium text-white py-4">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs font-mono hidden md:table-cell">
                          {user._id}
                        </TableCell>
                        <TableCell className="text-right">
                          {currentUser?._id === user._id ? (
                            <div className="flex justify-end gap-2">
                              <Dialog
                                open={isEditOpen}
                                onOpenChange={setIsEditOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-400 hover:bg-blue-400/10"
                                    onClick={() => setNewName(user.name)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-dashboard-card border-white/10 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Editar Perfil</DialogTitle>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Label className="mb-2 block text-white">
                                      Nome
                                    </Label>
                                    <Input
                                      value={newName}
                                      onChange={(e) =>
                                        setNewName(e.target.value)
                                      }
                                      className="bg-dashboard-bg border-white/10 text-white h-10"
                                    />
                                  </div>
                                  <Button
                                    onClick={handleUpdate}
                                    disabled={actionLoading}
                                    className="w-full bg-dashboard-highlight text-dashboard-card font-bold hover:bg-dashboard-highlight/90"
                                  >
                                    {actionLoading ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      "Salvar"
                                    )}
                                  </Button>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:bg-red-400/10"
                                onClick={handleDelete}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-dashboard-muted italic pr-2">
                              Visualizar apenas
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
