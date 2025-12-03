import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminRoute from '../AdminRoute';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  isAuthenticated: vi.fn(),
  getCurrentUser: vi.fn(),
}));

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is admin', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
    vi.mocked(api.getCurrentUser).mockReturnValue({
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
    });

    const { container } = render(
      <MemoryRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(container.textContent).toContain('Admin Content');
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(false);

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(container.textContent).not.toContain('Admin Content');
  });

  it('should redirect to dashboard when user is not admin', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
    vi.mocked(api.getCurrentUser).mockReturnValue({
      id: '1',
      email: 'user@test.com',
      name: 'Regular User',
      role: 'user',
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(container.textContent).not.toContain('Admin Content');
  });

  it('should redirect when user is null', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
    vi.mocked(api.getCurrentUser).mockReturnValue(null);

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(container.textContent).not.toContain('Admin Content');
  });
});

