/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import api from '@/services/weatherService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        localStorage.setItem('token', token);

        // Tenta carregar dados do usuário do localStorage primeiro
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Erro ao parsear usuário do localStorage:', e);
          }
        }

        // Depois tenta buscar da API
        try {
          const response = await api.get(`/api/users/me`);
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          // Se falhar mas tiver usuário salvo, mantém ele
          if (!savedUser) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } finally {
          setLoading(false);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    };
    loadUserData();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post(`/api/auth/login`, {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      // Salva token e usuário
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao fazer login',
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      // Primeiro registra
      await api.post(`/api/users`, {
        email,
        password,
        name,
      });

      // Depois faz login automaticamente
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar conta',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const updatePassword = async (userId, newPassword) => {
    try {
      await api.patch(`/api/users/${userId}`, {
        password: newPassword,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar senha',
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updatePassword,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context
export { AuthContext };
