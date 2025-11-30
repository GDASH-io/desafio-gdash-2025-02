import { useAuth } from '@/app/hooks/useAuth';
import { cn } from '@/app/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import LogoGdash from '../../assets/logo_gdash.webp';
import { Button } from '../../components/ui/button';

type NavOption = {
  label: string;
  path: string;
};

const navOptions: NavOption[] = [
  { label: 'Início', path: '/' },
  { label: 'Ver detalhes', path: '/weather' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Usuários', path: '/users' },
  { label: 'Explorar', path: '/explorer' },
];

function HeaderLayout() {
  const navigate = useNavigate();
  const currentLocation = useLocation().pathname;
  const { isSignedIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return currentLocation === path;
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 relative bg-white">
      <div className="container z-10 sticky top-0 mx-auto mb-6 max-w-7xl border-b border-gray-300 bg-white">
        <div className="flex justify-between items-center py-4">
          <img src={LogoGdash} alt="Gdash Logo" className="size-8 sm:size-10" />

          {isSignedIn && (
            <div className="hidden md:flex flex-1 justify-evenly px-6">
              {navOptions.map((option) => (
                <Link to={option.path} key={option.path}>
                  <p
                    className={cn(
                      'text-muted-foreground md:text-sm lg:text-base hover:text-gray-700 transition-all duration-300 hover:border-b hover:border-teal-800 whitespace-nowrap',
                      isActive(option.path) &&
                        'font-bold text-gray-900 border-b-2 border-teal-600',
                      option.path === '/explorer' &&
                        'text-teal-900 hover:text-teal-700 duration-100'
                    )}
                  >
                    {option.label}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <Button
            className="hidden md:block"
            onClick={isSignedIn ? signOut : () => navigate('/signin')}
          >
            {isSignedIn ? 'Sair' : 'Fazer Login'}
          </Button>

          {isSignedIn && (
            <div
              role="button"
              className="md:hidden p-2 border border-muted-foreground rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </div>
          )}

          {!isSignedIn && (
            <Button
              size="sm"
              className="md:hidden"
              onClick={() => navigate('/signin')}
            >
              Login
            </Button>
          )}
        </div>

        {isSignedIn && mobileMenuOpen && (
          <div className="absolute bg-black/90 w-full h-screen md:hidden p-6 rounded-md space-y-2">
            {navOptions.map((option) => (
              <Link
                to={option.path}
                key={option.path}
                onClick={handleNavClick}
              >
                <div
                  className={cn(
                    'block px-4 py-3 rounded-md text-white hover:bg-gray-800 transition-colors',
                    isActive(option.path) &&
                      'font-bold text-white bg-neutral-800',
                    option.path === '/explorer' && 'text-teal-600'
                  )}
                >
                  {option.label}
                </div>
              </Link>
            ))}
            <div className="w-full border border-neutral-500 rounded-md">
              <Button className="w-full" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="container mx-auto max-w-7xl h-full">
        <Outlet />
      </div>
    </div>
  );
}

export default HeaderLayout;
