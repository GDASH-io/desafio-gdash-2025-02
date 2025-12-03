import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../Navigation';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Mock ThemeToggle
vi.mock('../ThemeToggle/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/dashboard' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getCurrentUser).mockReturnValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'user',
    });
  });

  it('should render navigation with user info', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText('GDASH')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test User (test@test.com)')).toBeInTheDocument();
  });

  it('should show admin menu when user is admin', () => {
    vi.mocked(api.getCurrentUser).mockReturnValue({
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText('Usuários')).toBeInTheDocument();
  });

  it('should not show admin menu when user is not admin', () => {
    vi.mocked(api.getCurrentUser).mockReturnValue({
      id: '1',
      email: 'user@test.com',
      name: 'Regular User',
      role: 'user',
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.queryByText('Usuários')).not.toBeInTheDocument();
  });

  it('should navigate to dashboard when clicking Dashboard button', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle logout', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);

    expect(api.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should toggle extra menu', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const extraMenuButton = screen.getByText('Conteúdo Extra');
    fireEvent.click(extraMenuButton);

    expect(screen.getByText('Pokemon')).toBeInTheDocument();
    expect(screen.getByText('Star Wars')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
  });

  it('should navigate to pokemon when clicking Pokemon', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const extraMenuButton = screen.getByText('Conteúdo Extra');
    fireEvent.click(extraMenuButton);

    const pokemonButton = screen.getByText('Pokemon');
    fireEvent.click(pokemonButton);

    expect(mockNavigate).toHaveBeenCalledWith('/pokemon');
  });

  it('should close extra menu when clicking outside', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const extraMenuButton = screen.getByText('Conteúdo Extra');
    fireEvent.click(extraMenuButton);

    expect(screen.getByText('Pokemon')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Pokemon')).not.toBeInTheDocument();
    });
  });

  it('should show active state for current route', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText('Dashboard').closest('button');
    expect(dashboardButton).toHaveClass('bg-primary');
  });
});

