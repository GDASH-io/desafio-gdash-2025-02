import {
  MoreVertical,
  Shield,
  ShieldAlert,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/userType";

type UsersTableProps = {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UsersTable({
  users,
  loading,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
            <TableHead className="w-[350px]">Usuário</TableHead>
            <TableHead>Nível de Acesso</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span>Carregando equipe...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                Nenhum usuário encontrado com os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user._id}
                className="hover:bg-zinc-50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border uppercase
                      ${
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {user.email.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === "admin" ? (
                      <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Shield className="h-4 w-4 text-zinc-400" />
                    )}
                    <span className="capitalize text-zinc-700 text-sm font-medium">
                      {user.role === "admin"
                        ? "Administrador"
                        : "Usuário Padrão"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-zinc-500 text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-zinc-100"
                      >
                        <MoreVertical className="h-4 w-4 text-zinc-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Opções</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
