import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Cloud, Users, Search, LogOut } from 'lucide-react'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Cloud className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-foreground">
                  GDASH Weather
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-muted-foreground hover:text-foreground hover:border-blue-500 hover:border-b-2 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  🌤️ Dashboard
                </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/users"
                      className="border-transparent text-muted-foreground hover:text-foreground hover:border-blue-500 hover:border-b-2 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      👥 Usuários (CRUD Completo)
                    </Link>
                  )}
                <Link
                  to="/pokemon"
                  className="border-transparent text-muted-foreground hover:text-foreground hover:border-blue-500 hover:border-b-2 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  <Search className="w-4 h-4 mr-1" />
                  🎮 Pokémon (API Paginada)
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-4">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-foreground p-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}