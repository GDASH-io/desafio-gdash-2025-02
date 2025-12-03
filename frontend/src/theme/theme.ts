/**
 * Theme utilities - Funções para gerenciar tema claro/escuro
 * Chave do localStorage: 'gdash:theme'
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'gdash:theme';

/**
 * Obtém o tema salvo no localStorage
 * @returns Tema salvo ou null se não houver
 */
export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return null;
  } catch (error) {
    console.warn('[frontend][theme] Error reading theme from localStorage:', error);
    return null;
  }
}

/**
 * Salva o tema no localStorage
 * @param theme - Tema a ser salvo ('light' ou 'dark')
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('[frontend][theme] Error saving theme to localStorage:', error);
  }
}

/**
 * Remove o tema do localStorage
 */
export function clearStoredTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('[frontend][theme] Error clearing theme from localStorage:', error);
  }
}

/**
 * Detecta o tema do sistema operacional
 * @returns 'dark' se o sistema preferir tema escuro, 'light' caso contrário
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch (error) {
    console.warn('[frontend][theme] Error detecting system theme:', error);
    return 'light';
  }
}

/**
 * Aplica o tema ao documento HTML
 * @param theme - Tema a ser aplicado ('light' ou 'dark')
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }

  try {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Aplicar também a classe 'dark' para compatibilidade com Tailwind
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    console.log('[frontend][theme] Theme applied:', theme);
  } catch (error) {
    console.warn('[frontend][theme] Error applying theme:', error);
  }
}

/**
 * Obtém o tema inicial (salvo ou sistema)
 * @returns Tema a ser usado
 */
export function getInitialTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) {
    return stored;
  }
  return getSystemTheme();
}

/**
 * Escuta mudanças na preferência do sistema
 * @param callback - Função a ser chamada quando a preferência mudar
 * @returns Função para remover o listener
 */
export function watchSystemTheme(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    // Suporte para addEventListener (navegadores modernos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Fallback para addListener (navegadores antigos)
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  } catch (error) {
    console.warn('[frontend][theme] Error watching system theme:', error);
    return () => {};
  }
}

