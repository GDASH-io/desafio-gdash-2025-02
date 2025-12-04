import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;   // id do usuário
  email: string; // email do usuário
  exp: number;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    if (response.ok) {
    const data = await response.json();
    const token = data.token;
    localStorage.setItem("token", data.token);

    // decodificar token
    const decoded: TokenPayload = jwtDecode(token);
    localStorage.setItem("userEmail", decoded.email);
      navigate("/dashboard");
    } else {
      alert("Credenciais inválidas");
    }
  };

  const handleRegister = async () => {
    const response = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });
    if (response.ok) {
      alert("Conta criada com sucesso!");
      navigate("/");
    } else {
      alert("Erro ao criar conta");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-full">
          Entrar
        </Button>

        {/* Botão para abrir popup */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-2">
              Criar conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova conta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Novo email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handleRegister} className="w-full">
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
}
