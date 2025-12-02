import React, { useState } from "react";
import api from "../api";
import { AxiosError } from "axios";
import { Sun } from "lucide-react";

interface LoginProps {
  onLogin: (token: string) => void;
}

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const InputField = ({ type, value, onChange, placeholder }: InputFieldProps) => (
  <div className="mb-5">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        w-full p-3 rounded-xl 
        bg-slate-900/40 text-white
        border border-amber-400/20
        backdrop-blur-sm
        shadow-inner
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300
        transition-all
      "
      required
      autoComplete={type === "password" ? "current-password" : "username"}
    />
  </div>
);

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("admin@gdash.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);
      onLogin(data.access_token);
    } catch (err) {
      const error = err as AxiosError<any>;
      if (error.response?.status === 401) {
        setError("Email ou senha incorretos");
      } else {
        setError(error.response?.data?.message || "Erro ao logar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        relative overflow-hidden
      "
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,200,50,0.15),transparent)] pointer-events-none"></div>

      <form
        onSubmit={handleSubmit}
        className="
          bg-slate-900/60 backdrop-blur-xl
          shadow-xl shadow-amber-500/10
          border border-amber-400/20
          p-10 rounded-2xl w-96 
          text-white
          relative z-10
        "
      >
        <div className="flex flex-col items-center mb-8">
          <Sun
            size={48}
            className="text-amber-400 drop-shadow-[0_0_12px_rgba(255,200,0,0.7)]"
          />
          <h1 className="text-3xl font-bold mt-3 tracking-wide">
            GDASH 
          </h1>
          <p className="text-amber-300/80 text-sm mt-1 tracking-wide">
            Energia inteligente
          </p>
        </div>

        {error && (
          <p className="text-red-400 bg-red-900/30 p-2 rounded mb-4 text-center border border-red-500/20">
            {error}
          </p>
        )}

        <InputField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <InputField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />

        <button
          type="submit"
          className="
            w-full p-3 rounded-xl font-semibold
            bg-amber-500/90 text-slate-900
            shadow-lg shadow-amber-300/20
            hover:bg-amber-400 hover:shadow-amber-300/40
            transition-all
            disabled:opacity-60
          "
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
