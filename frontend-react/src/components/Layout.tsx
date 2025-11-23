import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-primary">
            GDASH
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </Link>
            <Link to="/records" className="text-sm hover:text-primary">
              Registros
            </Link>
            <Link to="/nasa" className="text-sm hover:text-primary">
              NASA
            </Link>
            {user?.role === 'admin' && (
              <Link to="/users" className="text-sm hover:text-primary">
                Usuários
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}


