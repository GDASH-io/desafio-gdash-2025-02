import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Navbar from './Navbar';

const MockNavbar = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render app title', () => {
    render(<MockNavbar />);

    expect(screen.getByText(/weather dashboard/i)).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<MockNavbar />);

    // Check for links by role
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // Verify specific navigation items are present (using getAllByText since they appear twice - desktop and mobile)
    const insightsLinks = screen.getAllByText(/insights ia/i);
    expect(insightsLinks.length).toBeGreaterThan(0);
  });

  it('should render theme toggle button', () => {
    render(<MockNavbar />);

    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('should render login button when not authenticated', () => {
    render(<MockNavbar />);

    // User starts not authenticated
    expect(screen.getByText(/entrar/i)).toBeInTheDocument();
  });
});
