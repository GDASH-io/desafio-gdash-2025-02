import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react'
import { useThemeStore } from '@/stores/theme.store'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export const Header = () => {
  const { isDark, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold font-hand text-primary">
              Weather Dashboard
            </h1>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/users"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Users
            </Link>
            <Link
              to="/explorar"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <UserIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
