import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import type { IUser } from "../interfaces/user.interface";

interface UserDeleteConfirmationProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

const UserDeleteConfirmation: React.FC<UserDeleteConfirmationProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    if (user?._id) {
      onConfirm(user._id);
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-32 data-[state=open]:slide-in-from-top-32 duration-300">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja deletar permanentemente o usuário
            {user?.email}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteConfirmation;
