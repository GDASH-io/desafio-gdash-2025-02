import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/50">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Sistema Online</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer border border-gray-200/50 shadow-sm hover:shadow-md">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 via-blue-400 to-cyan-500 flex items-center justify-center shadow-md ring-2 ring-white">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">{user?.name || 'Usuário'}</span>
              <span className="text-xs text-gray-500 font-medium">{user?.role || 'user'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

