import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Clima Campina Grande" }: HeaderProps) {
  const { user, logoutUser } = useAuth();

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold">{title}</span>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-sm text-gray-500">Dashboard</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {user ? `${user.email} (${user.role})` : "Convidado"}
        </span>
        <Button variant="outline" onClick={logoutUser}>
          Sair
        </Button>
      </div>
    </header>
  );
}
