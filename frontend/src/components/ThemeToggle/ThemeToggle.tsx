import React from 'react';
import { useTheme } from '../../context/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  /**
   * Tamanho do ícone em pixels
   * @default 20
   */
  size?: number;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Se true, mostra apenas o ícone sem texto
   * @default true
   */
  iconOnly?: boolean;
}

/**
 * Componente toggle para alternar entre tema claro e escuro
 * Inclui animações suaves e suporte completo de acessibilidade
 */
export function ThemeToggle({ size = 20, className = '', iconOnly = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    toggleTheme();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-pressed={isDark}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center justify-center
        p-2 rounded-lg
        bg-secondary hover:bg-accent
        text-foreground
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        cursor-pointer
        ${className}
      `}
      style={{
        minWidth: iconOnly ? `${size + 16}px` : 'auto',
        minHeight: `${size + 16}px`,
      }}
    >
      {/* Ícones com animação de rotação e fade */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sol - visível no tema claro */}
        <Sun
          size={size}
          className={`
            absolute transition-all duration-300 ease-in-out
            ${isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
          aria-hidden="true"
        />
        
        {/* Lua - visível no tema escuro */}
        <Moon
          size={size}
          className={`
            absolute transition-all duration-300 ease-in-out
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
          aria-hidden="true"
        />
      </div>

      {/* Texto opcional (se iconOnly = false) */}
      {!iconOnly && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Tema escuro' : 'Tema claro'}
        </span>
      )}
    </button>
  );
}

