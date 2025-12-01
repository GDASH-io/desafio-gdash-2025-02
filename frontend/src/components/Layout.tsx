import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut,  Users, Airplay  } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.png" className="h-20 w-20" alt="Logo da aplicação clicável que direciona para a página principal."/>
                <span className="text-xl font-bold">Weathernator</span>
              </Link>
              <div className="flex space-x-4">
                <Link to="/">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link to="/users">
                  <Button variant="ghost">
                    <Users className="h-4 w-4 mr-2" />
                    Usuários
                  </Button>
                </Link>
                <Link to="/pokedex">
                
                  <Button variant="ghost">
                    <Airplay className="h-4 w-4 mr-2"/>
                    Pokédex
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

