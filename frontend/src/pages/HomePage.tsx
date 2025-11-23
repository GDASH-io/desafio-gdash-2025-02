import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao sair", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Weather Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer">
          Sair
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Bem-vindo à tela Home 🚀
          </h2>
          <p className="text-slate-300">
            Aqui depois vamos colocar os gráficos e insights de clima.
          </p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
