import { useState, type SetStateAction } from "react";
import { useNavigate} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CloudSun } from "lucide-react";
import { authApi } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.access_token) {
         localStorage.setItem('token', response.access_token);
         if (response.user) {
             localStorage.setItem('user', JSON.stringify(response.user));
         }
         
         toast.success("Login realizado com sucesso!");
         navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Erro ao realizar login. Verifique suas credenciais.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <CloudSun className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Climate Sync</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
