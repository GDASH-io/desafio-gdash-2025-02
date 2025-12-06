import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Sidebar() {
  const { logout } = useAuth();

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Usuários' },
    { to: '/explore', icon: Globe, label: 'Explorar' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r bg-white">
      <div className="flex h-full flex-col items-center">
        {/* Logo - Container h-16 para alinhar com Header */}
        <div className="flex h-16 w-full items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
            <img 
              src="/IconWeAItherBranco.png" 
              alt="WeAIther" 
              className="h-6 w-6 object-contain" 
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-6 flex w-full flex-1 flex-col items-center gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto pb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}