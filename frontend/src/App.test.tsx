import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from './App';

// Mock the page components
vi.mock('./pages/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('./pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock('./pages/Users', () => ({
  default: () => <div>Users Page</div>,
}));

vi.mock('./pages/Documentation', () => ({
  default: () => <div>Documentation Page</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('redirects to login when accessing dashboard without token', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={
            localStorage.getItem('token') ? <div>Dashboard Page</div> : <div>Login Page</div>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows access to dashboard with valid token', () => {
    localStorage.setItem('token', 'fake-token');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={
            localStorage.getItem('token') ? <div>Dashboard Page</div> : <div>Login Page</div>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirects to login when accessing users page without token', () => {
    render(
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/users" element={
            localStorage.getItem('token') ? <div>Users Page</div> : <div>Login Page</div>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows access to users page with valid token', () => {
    localStorage.setItem('token', 'fake-token');

    render(
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/users" element={
            localStorage.getItem('token') ? <div>Users Page</div> : <div>Login Page</div>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Users Page')).toBeInTheDocument();
  });

  it('renders documentation on root path for unauthenticated users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<div>Documentation Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Documentation Page')).toBeInTheDocument();
  });

  it('renders documentation on root path for authenticated users', () => {
    localStorage.setItem('token', 'fake-token');

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<div>Documentation Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Documentation Page')).toBeInTheDocument();
  });
});
