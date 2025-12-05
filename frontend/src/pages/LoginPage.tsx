import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");


    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(/assets/01_0011_BG.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Barra superior */}
      <img src="/assets/01_0007_BARRA.png" alt="" className="absolute top-0 left-0 w-full" />
      
      <div className="relative w-full max-w-md">
        {/* Box de login */}
        <div 
          className="relative p-8 pb-16"
          style={{
            backgroundImage: `url(/assets/01_0010_BOX.png)`,
            backgroundSize: '100% 74%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            minHeight: '480px'
          }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <img src="/assets/01_0009_LOGO.png" alt="Logo" className="mx-auto mb-4" />
            <img src="/assets/01_0003_GDASHWEATHER.png" alt="GDASH Weather" className="mx-auto mb-2" />
            <img src="/assets/01_0004_Sistema-de-Monitoramento-Climático.png" alt="Sistema de monitoramento climático" className="mx-auto" />
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de email */}
            <div className="relative">
              <img src="/assets/01_0002_email.png" alt="Email" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Campo de senha */}
            <div className="relative">
              <img src="/assets/01_0001_senha.png" alt="Senha" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}


            {/* Botão de entrar */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relative transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  width: '180px',
                  height: '50px'
                }}
              >
                {/* Imagem de fundo do botão (oval branco) */}
                <img 
                  src="/assets/01_0006_BOTÃO.png" 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
                
                {/* Texto "entrar" */}
                <div className="relative flex items-center justify-center h-full">
                  <img 
                    src="/assets/01_0000_entrar.png" 
                    alt={loading ? "Entrando..." : "Entrar"} 
                    className="h-3"
                  />
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Texto de usuário padrão - MOVIDO PRA FORA */}
        <div className="mt-4 text-center">
          <img src="/assets/01_0005_Usuário-padrão_-admin@gdash.com---admin123.png" alt="Usuário padrão" className="mx-auto" />
        </div>
      </div>


      {/* Barra inferior */}
      <img src="/assets/01_0008_BARRA.png" alt="" className="absolute bottom-0 left-0 w-full" />
    </div>
  );
}
