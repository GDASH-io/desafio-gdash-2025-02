import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Cloud, Users, Search } from 'lucide-react';

type IsActive = {
  isActive: boolean
}

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">GDASH</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }: IsActive) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-gray-900 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`
                  }
                >
                  <Cloud className="mr-2 h-4 w-4" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/users"
                  className={({ isActive }: IsActive) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-gray-900 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Usuários
                </NavLink>
                <NavLink
                  to="/explore"
                  className={({ isActive }: IsActive) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-gray-900 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`
                  }
                >
                  <Search className="mr-2 h-4 w-4" />
                  Explorar
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name || user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

