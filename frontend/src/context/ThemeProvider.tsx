import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme } from '../theme/theme';
import {
  getStoredTheme,
  setStoredTheme,
  getSystemTheme,
  applyTheme,
  getInitialTheme,
  watchSystemTheme,
} from '../theme/theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Se true, sincroniza o tema com a preferência do sistema quando não há preferência salva
   * @default true
   */
  syncWithSystem?: boolean;
}

/**
 * Provider de tema que gerencia estado global e persistência
 */
export function ThemeProvider({ children, syncWithSystem = true }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Inicializar com o tema já aplicado pelo script anti-FOUC
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light' || currentTheme === 'dark') {
      return currentTheme;
    }
    return getInitialTheme();
  });

  // Aplicar tema ao DOM sempre que o estado mudar
  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  // Sincronizar com preferência do sistema se não houver tema salvo
  useEffect(() => {
    if (!syncWithSystem) {
      return;
    }

    const stored = getStoredTheme();
    if (stored) {
      // Se há tema salvo, não sincronizar com sistema
      return;
    }

    // Aplicar tema do sistema inicialmente
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);

    // Escutar mudanças na preferência do sistema
    const unwatch = watchSystemTheme((newTheme) => {
      const stored = getStoredTheme();
      // Só aplicar se não houver preferência salva pelo usuário
      if (!stored) {
        setThemeState(newTheme);
      }
    });

    return unwatch;
  }, [syncWithSystem]);

  /**
   * Define o tema e salva no localStorage
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  /**
   * Alterna entre tema claro e escuro
   */
  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook para acessar o contexto de tema
 * @throws Error se usado fora do ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

