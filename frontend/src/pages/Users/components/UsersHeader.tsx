import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type UsersHeaderProps = {
  onCreate: () => void;
};

export function UsersHeader({ onCreate }: UsersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Gerenciamento de Usuários
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Administre quem tem acesso ao sistema.
        </p>
      </div>
      <Button
        onClick={onCreate}
        className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm"
      >
        <Plus className="h-4 w-4" /> Novo Usuário
      </Button>
    </div>
  );
}
