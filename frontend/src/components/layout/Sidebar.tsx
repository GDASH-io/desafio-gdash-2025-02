import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-full border-r bg-white flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Navegação</h2>
        <p className="text-xs text-gray-500">Clima Campina Grande</p>
      </div>
      <Separator />
      <nav className="p-2 space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
          Visão Geral
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/weather/logs')}>
          Registros de Clima
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/insights')}>
          Insights IA
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/exports')}>
          Exportações
        </Button>
      </nav>
      <div className="mt-auto p-4 text-xs text-gray-500">
        © 2025 GDash
      </div>
    </aside>
  );
}
