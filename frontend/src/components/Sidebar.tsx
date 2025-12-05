import { useNavigate } from "react-router-dom";

interface SidebarProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarProps) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-50 border-r border-slate-800 p-6 flex flex-col gap-6 bg-slate-900/50">
        <h1 className="text-xl font-bold">
          GDASH <span className="text-emerald-400">Admin</span>
        </h1>

        <nav className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-left px-3 py-2 rounded hover:bg-slate-800"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/users")}
            className="text-left px-3 py-2 rounded hover:bg-slate-800"
          >
            Usuários
          </button>

          <button
            onClick={() => navigate("/explorar")}
            className="text-left px-3 py-2 rounded hover:bg-slate-800"
            >
            Explorar API
            </button>

          {/* espaço para nova página depois */}
          {/* <button
            onClick={() => navigate("/explorar")}
            className="text-left px-3 py-2 rounded hover:bg-slate-800"
          >
            Explorar API
          </button> */}
        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="text-left px-3 py-2 rounded hover:bg-red-600 hover:bg-opacity-20 text-red-400"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
