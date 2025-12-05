import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Compass, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-emerald-600',
    activeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Usuários',
    href: '/users',
    icon: Users,
    color: 'text-blue-600',
    activeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'Explorar',
    href: '/explore',
    icon: Compass,
    color: 'text-purple-600',
    activeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="h-20 flex items-center justify-center border-b border-gray-300/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 shadow-lg relative overflow-hidden">
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        <img 
          src="/GDASH.png" 
          alt="GDASH Logo" 
          className="h-14 w-auto object-contain relative z-10 drop-shadow-lg"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                'hover:bg-gray-50 hover:shadow-sm',
                isActive
                  ? item.activeColor + ' shadow-sm border-l-4 font-semibold'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive ? item.color : 'text-gray-500 group-hover:text-gray-700',
                  'group-hover:scale-110'
                )}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
};

