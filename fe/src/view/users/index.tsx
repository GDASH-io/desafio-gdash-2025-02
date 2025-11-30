import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/confirmModal";
import { UsersTableSkeleton } from "../../components/skeletons/UsersTableSkeleton";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CreateUserModal } from "./components/createUserModal";
import { EditUserModal } from "./components/editUserModal";
import { useUserController } from "./useUsersController";

function Users() {
  const {
    isMe,
    isAdmin,
    user,
    userToEdit,
    setUserToEdit,
    isEditModalOpen,
    setIsEditModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isLoading,
    onCloseEditModal,
    onCloseCreateModal,
    onDeleteUser,
    users,
  } = useUserController();

  if (isLoading) {
    return <UsersTableSkeleton />;
  }
  return (
    <div className="w-full overflow-y-auto">
      {userToEdit && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          user={userToEdit}
        />
      )}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
      />

      <ConfirmModal
        isDeleteDialogOpen={!!isDeleteDialogOpen}
        title="Tem certeza que deseja excluir o usuário ?"
        onConfirm={onDeleteUser}
        onClose={() => setIsDeleteDialogOpen("")}
      />

      {isAdmin(user?.role) && (
        <div className="w-full flex justify-end items-center">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="mb-4"
            size="sm"
          >
            Criar Usuário
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="text-right font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users
            ?.filter((u) => isMe(u.id))
            .map((u) => (
              <TableRow
                key={u.id}
                className="hover:bg-muted/50 transition-colors bg-linear-to-l from-primary/15 via-primary/10 to-transparent"
              >
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Badge variant={isAdmin(u?.role) ? "secondary" : "default"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {(isAdmin(user?.role) ||
                      (!isAdmin(user?.role) && isMe(u?.id || ""))) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setUserToEdit(u);
                          setIsEditModalOpen(true);
                        }}
                        className="gap-2 hover:text-muted-foreground hover:border-primary transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    )}

                    {!isMe(u?.id || "") && isAdmin(user?.role) && (
                      <Button
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(u.id)}
                        className="gap-2 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          {users
            ?.filter((u) => !isMe(u.id))
            .map((u) => (
              <TableRow
                key={u.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Badge variant={isAdmin(u?.role) ? "secondary" : "default"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {(isAdmin(user?.role) ||
                      (!isAdmin(user?.role) && isMe(u?.id || ""))) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setUserToEdit(u);
                          setIsEditModalOpen(true);
                        }}
                        className="gap-2 hover:text-muted-foreground hover:border-primary transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    )}

                    {!isMe(u?.id || "") && isAdmin(user?.role) && (
                      <Button
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(u.id)}
                        className="gap-2 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default Users;
