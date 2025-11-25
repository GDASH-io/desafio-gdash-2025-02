import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Cloud, Users, LogOut } from "lucide-react";
import "./Layout.css";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Cloud size={32} />
            <span>GDASH</span>
          </div>

          <div className="nav-links">
            <Link to="/" className="nav-link">
              <Cloud size={20} />
              Dashboard
            </Link>
            <Link to="/users" className="nav-link">
              <Users size={20} />
              Usuários
            </Link>
            <Link to="/pokemon" className="nav-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
              </svg>
              Pokédex
            </Link>
          </div>

          <div className="nav-user">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
