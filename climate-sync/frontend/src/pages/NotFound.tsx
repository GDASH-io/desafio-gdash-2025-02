import { Button } from "@/components/ui/button";
import { CloudOff, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        {/* Icon Container with subtle animation */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative bg-card p-6 rounded-full shadow-lg border border-border">
            <CloudOff className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground">
            Ops! Parece que as nuvens encobriram o caminho. A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button 
            onClick={() => navigate("/")} 
            size="lg" 
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Home className="h-4 w-4" />
            Voltar para o Início
          </Button>
        </div>
      </div>
      
      {/* Footer decoration */}
      <div className="fixed bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
    </div>
  );
};

export default NotFound;
