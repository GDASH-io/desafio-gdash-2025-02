import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/userType";
import { UserForm } from "./UserForm";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit: User | null;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  userToEdit,
  onSubmit,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {userToEdit ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {userToEdit
              ? "Atualize as permissões ou senha do usuário abaixo."
              : "Preencha os dados para criar um novo acesso ao sistema."}
          </DialogDescription>
        </DialogHeader>

        {/* Renderiza o formulário isolado, passando a função de fechar */}
        <UserForm
          userToEdit={userToEdit}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
