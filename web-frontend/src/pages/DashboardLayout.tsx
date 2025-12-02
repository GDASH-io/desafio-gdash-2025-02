import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Users, LogOut, Sun } from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/60 border-r border-amber-300/20 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <Sun className="text-amber-400" />
          <h1 className="text-xl font-bold tracking-wide">GDASH</h1>
        </div>

        <nav className="flex flex-col gap-3">
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `p-3 rounded-lg transition ${
                isActive
                  ? "bg-amber-500/20 text-amber-300"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            <Users className="inline-block mr-2" size={18} />
            Usuários
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex w-full items-center gap-2 p-3 rounded-lg hover:bg-red-500/20 text-red-300 transition"
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
