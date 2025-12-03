import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { logout, getCurrentUser } from "../services/api";
import { ThemeToggle } from "./ThemeToggle/ThemeToggle";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false);
  const extraMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isExtraContentActive = () => {
    return location.pathname === "/pokemon" || 
           location.pathname === "/starwars" || 
           location.pathname === "/games";
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (extraMenuRef.current && !extraMenuRef.current.contains(event.target as Node)) {
        setIsExtraMenuOpen(false);
      }
    };

    if (isExtraMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExtraMenuOpen]);

  return (
    <nav className="bg-card border-b border-border shadow-md mb-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">GDASH</h1>
            <div className="flex gap-2">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                onClick={() => navigate("/dashboard")}
                size="sm"
              >
                Dashboard
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant={isActive("/users") ? "default" : "ghost"}
                  onClick={() => navigate("/users")}
                  size="sm"
                >
                  Usuários
                </Button>
              )}
              <div className="relative" ref={extraMenuRef}>
                <Button
                  variant={isExtraContentActive() ? "default" : "ghost"}
                  onClick={() => setIsExtraMenuOpen(!isExtraMenuOpen)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Conteúdo Extra
                  <svg
                    className={`w-4 h-4 transition-transform ${isExtraMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                {isExtraMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-popover rounded-lg shadow-lg border border-border py-1 min-w-[160px] z-50">
                    <button
                      onClick={() => {
                        navigate("/pokemon");
                        setIsExtraMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors text-popover-foreground ${
                        isActive("/pokemon") ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      Pokemon
                    </button>
                    <button
                      onClick={() => {
                        navigate("/starwars");
                        setIsExtraMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors text-popover-foreground ${
                        isActive("/starwars") ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      Star Wars
                    </button>
                    <button
                      onClick={() => {
                        navigate("/games");
                        setIsExtraMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors text-popover-foreground ${
                        isActive("/games") ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      Games
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.name} ({user.email})
              </span>
            )}
            <Button variant="outline" onClick={handleLogout} size="sm">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

