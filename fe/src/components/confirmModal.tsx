import { type ReactNode } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface ConfirmModalProps {
  isDeleteDialogOpen: boolean;
  title: string
  children?: ReactNode;
  onConfirm: () => void;
  onClose?: () => void;
}

function ConfirmModal({
  isDeleteDialogOpen,
  title,
  children,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {children}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white hover:text-muted-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  )
}

export default ConfirmModal