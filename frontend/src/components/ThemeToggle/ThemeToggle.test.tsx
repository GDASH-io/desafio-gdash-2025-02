import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeProvider';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia para prefers-color-scheme
const mockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o componente', () => {
    window.matchMedia = mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
  });

  it('deve alternar entre tema claro e escuro ao clicar', async () => {
    window.matchMedia = mockMatchMedia(false);
    localStorageMock.setItem('gdash:theme', 'light');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    
    // Verificar estado inicial (light)
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Clicar para alternar para dark
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorageMock.getItem('gdash:theme')).toBe('dark');
    });

    // Clicar novamente para alternar para light
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorageMock.getItem('gdash:theme')).toBe('light');
    });
  });

  it('deve alternar tema ao pressionar Enter', async () => {
    window.matchMedia = mockMatchMedia(false);
    localStorageMock.setItem('gdash:theme', 'light');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    
    // Pressionar Enter
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('deve alternar tema ao pressionar Espaço', async () => {
    window.matchMedia = mockMatchMedia(false);
    localStorageMock.setItem('gdash:theme', 'light');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    
    // Pressionar Espaço
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('deve ter labels de acessibilidade apropriados', () => {
    window.matchMedia = mockMatchMedia(false);
    localStorageMock.setItem('gdash:theme', 'light');

    const { rerender } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    let button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label', 'Ativar tema escuro');

    // Alternar para dark
    fireEvent.click(button);

    rerender(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label', 'Ativar tema claro');
  });

  it('deve persistir o tema no localStorage', async () => {
    window.matchMedia = mockMatchMedia(false);
    localStorageMock.clear();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    
    // Alternar para dark
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorageMock.getItem('gdash:theme')).toBe('dark');
    });

    // Alternar para light
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorageMock.getItem('gdash:theme')).toBe('light');
    });
  });

  it('deve aplicar a classe dark ao documento quando tema escuro está ativo', async () => {
    window.matchMedia = mockMatchMedia(false);
    localStorageMock.setItem('gdash:theme', 'light');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('deve aceitar className personalizada', () => {
    window.matchMedia = mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle className="custom-class" />
      </ThemeProvider>
    );

    const button = screen.getByRole('switch');
    expect(button).toHaveClass('custom-class');
  });

  it('deve usar tema do sistema quando não há preferência salva', () => {
    window.matchMedia = mockMatchMedia(true); // Sistema prefere dark
    localStorageMock.clear();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Deve usar tema dark do sistema
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

