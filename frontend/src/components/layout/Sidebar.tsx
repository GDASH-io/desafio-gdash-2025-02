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
      <div className="flex h-full flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>

        {/* Menu */}
        <TooltipProvider>
          <nav className="flex flex-1 flex-col gap-2">
            {menuItems.map((item) => (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>

        {/* Logout */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600"
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
    </aside>
  );
}