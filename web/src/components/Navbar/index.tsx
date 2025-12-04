import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loggedUser, setLoggedUser] = useState<{ id: string; email: string; token: string } | null>(null);

  useEffect(() => {
    // 👇 Captura email/id do usuário logado do localStorage
    const email = localStorage.getItem("userEmail") || '';
    const token = localStorage.getItem("token") || '';
    
    // 👇 Buscar todos usuários
    fetch("http://localhost:3000/api/users", {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // 👈 envia token no header
  },})
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
      
        const found = data.find((user: any) => {
          if(user.email === email) {
            console.log("user =>", user);
            return user.id;
          }
        });
        console.log("retorno =>",found);
        const id = found ? found.id : '';
        setLoggedUser({ id, email, token });
      }
    )
      .catch((err) => console.error("Erro ao buscar usuários:", err)); 
  }, []);

  
  
  const handleDelete = async (id?: string) => {
    console.log("id =>", id);
    
    const url = `http://localhost:3000/api/users/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loggedUser?.token}`, // 👈 envia token no header
  },
    });

    if (response.ok) {
      alert("Conta excluída com sucesso!");
      localStorage.clear();
      navigate("/");
    } else {
      alert("Erro ao excluir conta");
    }
  };

  const handleLogout = async () => {
      alert("Logout realizado com sucesso!");
      localStorage.clear();
      navigate("/");
  };

  const tabs = [
    { path: "/dashboard", label: "🌦️ Dashboard" },
    { path: "/pokemons", label: "🟡 Pokémons" },
  ];

  return (
    <nav className="flex justify-between items-center bg-gray-100 p-4 rounded">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "px-4 py-2 rounded hover:bg-blue-200",
              location.pathname === tab.path
                ? "bg-blue-500 text-white"
                : "bg-white"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Ícone de usuário + email logado */}
      <div className="flex items-center gap-2">
        {loggedUser && <span className="text-sm">{loggedUser.email}</span>}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciamento de Conta</DialogTitle>
            </DialogHeader>

            {/* Lista de usuários (exceto o logado) */}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {Array.isArray(users) &&
                users
                  .filter((u) => u.email !== loggedUser?.email)
                  .map((u) => (
                    <li
                      key={u._id}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <span>
                        {u.email}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
                      >
                        Excluir
                      </Button>
                    </li>
                  ))}
            </ul>

            {/* Botões finais */}
            <div className="mt-6 space-y-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDelete(loggedUser?.id)}
              >
                Excluir minha conta
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
