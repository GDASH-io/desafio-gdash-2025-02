import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';

const navItems = [
  { label: 'Painel', path: '/dashboard' },
  { label: 'Filmes', path: '/movies' },
  { label: 'Logs', path: '/logs' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 text-foreground border-b border-white/5 sticky top-0 z-30">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold tracking-wide text-xl" onClick={closeMenu}>
          GDASH
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link to={item.path} key={item.path} onClick={closeMenu}>
              <Button variant="ghost" className="text-sm text-foreground hover:text-primary/90">
                {item.label}
              </Button>
            </Link>
          ))}
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
              <span className="text-xs text-[#9CA3AF] hidden lg:inline">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm text-foreground hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Abrir menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background">
          <nav className="flex flex-col gap-2 px-4 py-3">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={closeMenu} className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base text-foreground hover:text-primary/90 hover:bg-primary/10"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {user && (
              <>
                <div className="px-3 py-2 text-xs text-[#9CA3AF] border-t border-white/5 mt-2 pt-2">
                  {user.email}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-base text-foreground hover:text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
