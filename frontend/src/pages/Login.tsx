import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import gdashLogo from "../assets/gdash.png";
import { LoginForm } from "../components/auth/LoginForm";
import { SignupForm } from "../components/auth/SignupForm";

export function Login() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#151C2F] text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#50E3C2]/20 via-[#151C2F] to-[#151C2F]"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#50E3C2]/10 via-transparent to-transparent"></div>

        <div className="relative z-10">
          <img
            src={gdashLogo}
            alt="GDASH Logo"
            className="h-16 w-auto object-contain rounded-lg shadow-lg shadow-[#50E3C2]/10"
          />
        </div>

        <div className="relative z-10 mb-24">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Monitoramento climático{" "}
            <span className="text-[#50E3C2]">inteligente</span> em tempo real.
          </h2>
          <ul className="space-y-4 text-lg text-gray-300">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#50E3C2]" /> Ingestão de
              dados de alta performance.
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#50E3C2]" /> Análise
              preditiva com Inteligência Artificial.
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#50E3C2]" /> Dashboards
              executivos e operacionais.
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          © {new Date().getFullYear()} GDASH Technology. Todos os direitos
          reservados.
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        {isRegister ? (
          <SignupForm onSwitchMode={() => setIsRegister(false)} />
        ) : (
          <LoginForm onSwitchMode={() => setIsRegister(true)} />
        )}
      </div>
    </div>
  );
}
