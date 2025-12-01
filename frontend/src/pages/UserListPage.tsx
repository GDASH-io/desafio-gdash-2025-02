import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { authService } from "@/services/authService";
import type { User } from "@/interfaces/auth";
import { toast } from "sonner";

import { API_BASE_URL } from "@/config/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const data = await authService.listUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function getAvatarUrl(user: User) {
    if (!user.avatar) return undefined;
    if (user.avatar.startsWith("http")) return user.avatar;
    return `${API_BASE_URL}${user.avatar}`;
  }

  async function handleDelete(id: number) {
    const confirm = window.confirm("Tem certeza que deseja remover este usuário?");
    if (!confirm) return;

    try {
      setDeletingId(id);
      await authService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Usuário removido com sucesso.");
    } catch (error) {
      toast.error("Erro ao remover usuário", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Pode reaproveitar o AppHeader com props "dummy" de clima */}
      <AppHeader
        selectedCity="Brasília"
        onGenerateWeather={() => {}}
        isGeneratingWeather={false}
      />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto w-full space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Usuários</h1>
            <p className="text-sm text-slate-400">
              Lista de usuários cadastrados no sistema.
            </p>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-900/80">
                <TableHead className="w-[72px] text-slate-200 font-semibold">
                  Avatar
                </TableHead>
                <TableHead className="text-slate-200 font-semibold">
                  Nome
                </TableHead>
                <TableHead className="text-slate-200 font-semibold">
                  Email
                </TableHead>
                <TableHead className="w-20 text-center text-slate-200 font-semibold">
                  ID
                </TableHead>
                <TableHead className="w-32 text-right text-slate-200 font-semibold">
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="w-9 h-9">
                        {getAvatarUrl(user) ? (
                          <AvatarImage
                            src={getAvatarUrl(user)}
                            alt={user.username}
                          />
                        ) : (
                          <AvatarFallback className="bg-slate-700">
                            {user.username?.[0]?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center text-slate-400">
                      {user.id}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-60"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {deletingId === user.id ? "Removendo..." : "Remover"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

export default UsersListPage;
