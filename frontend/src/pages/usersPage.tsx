import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import type { IUser } from "../interfaces/user.interface";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import Navbar from "../components/navBar";
import { Button } from "../components/ui/button";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import UserFormDialog from "../components/userFormDialog";
import PaginationControls from "../components/paginationControls";
import UserDeleteConfirmation from "../components/deleteConfirmationDialog";

const UsersPage: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    currentPage,
    totalPages,
    totalItems,
    changePage,
  } = useUsers();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | undefined>(undefined);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);

  const handleOpenCreate = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: IUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (user: IUser) => {
    setDeletingUser(user);
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteUser(id);
    setDeletingUser(null);
  };

  const handleFormSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    const isEditing = !!editingUser;
    if (isEditing) {
      await updateUser(editingUser._id, data);
    } else {
      await createUser(data as CreateUserDto);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe]">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#28364F]">
            Gerenciamento de Usuários
          </h1>
          <Button variant="gdash" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Criar Novo
          </Button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-[#28364F]" />
            <p className="text-[#28364F]">Carregando usuários...</p>
          </div>
        ) : (
          <div className="rounded-md border bg-white shadow-md">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Criado Em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-gray-500"
                    >
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              changePage={changePage}
              nameItem="Usuários"
            />
          </div>
        )}
      </main>

      <UserFormDialog
        user={editingUser}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <UserDeleteConfirmation
        user={deletingUser}
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UsersPage;
