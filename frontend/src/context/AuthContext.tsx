import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials } from '../services/authService';
import { checkSession, login, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Verifica a sessão ao carregar a aplicação
  useEffect(() => {
    const loadUser = async () => {
      const userData = await checkSession();
      setUser(userData);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // 2. Lógica de Login
  const loginUser = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const userData = await login(credentials);
      setUser(userData);
      navigate('/dashboard'); // Redireciona para o Dashboard
    } catch (error) {
      // Relança o erro para ser tratado no componente de Login
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Lógica de Logout
  const logoutUser = async () => {
    await logout();
    setUser(null);
    navigate('/login'); // Redireciona para o Login
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};