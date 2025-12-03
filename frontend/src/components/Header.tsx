import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import {
  CloudSun,
  Edit2Icon,
  LogOut,
  MenuIcon,
  Trash2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface DashboardHeaderProps {
  email?: string;
  userName?: string;
  onLogout?: () => void;
}

export const Header = ({ userName, onLogout, email }: DashboardHeaderProps) => {
  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const { mutate, isPending } = useDeleteUser();
  const handleDelete = () => {
    mutate();
  };
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-200 from-primary to-secondary flex items-center justify-center">
            <CloudSun className="w-5 h-5 text-primary-foreground" />
          </div>
          <Link to="/">
            <h1 className="text-xl font-bold text-foreground">
              Dashboard Meteorológico
            </h1>
            <p className="text-sm text-muted-foreground">Dados em tempo real</p>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {userName}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="border-2">
              <MenuIcon className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-amber-50">
              <DropdownMenuLabel>{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-amber-200">
                <Link to="/update" className="flex justify-between w-full ml-1">
                  <p>Editar conta</p>
                  <Edit2Icon />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between" asChild>
                <Dialog>
                  <DialogTrigger asChild className="">
                    <Button className="bg-amber-50 hover:bg-amber-200 w-full flex justify-between">
                      Excluir conta
                      <Trash2Icon size={18} />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-amber-50">
                    <DialogHeader>
                      <DialogTitle>
                        Tem certeza que deseja excluir sua conta?
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        Esta ação não pode ser desfeita. Isso irá remover
                        permanentemente sua conta e todos os seus dados.
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-5">
                      <DialogClose className="bg-black/15">
                        Cancelar
                      </DialogClose>

                      <Button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-red-500 hover:bg-red-400 text-gray-200 py-5"
                      >
                        {isPending ? "Excluindo..." : "Excluir conta"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
