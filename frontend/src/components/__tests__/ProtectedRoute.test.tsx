import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  isAuthenticated: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when authenticated', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(container.textContent).toContain('Protected Content');
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(false);

    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should not render children
    expect(container.textContent).not.toContain('Protected Content');
  });
});

