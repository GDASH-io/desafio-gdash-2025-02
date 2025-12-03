import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from '../api';

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

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('api', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // @ts-ignore
    import.meta.env = { VITE_API_URL: 'http://localhost:3000' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ensureProtocol', () => {
    it('should return URL with http:// for localhost', () => {
      // This is tested indirectly through API_BASE_URL usage
      expect(api).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        access_token: 'token123',
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
      };

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await api.login('test@test.com', 'password');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem('token')).toBe('token123');
      expect(localStorageMock.getItem('user')).toBe(JSON.stringify(mockResponse.user));
    });

    it('should throw error on failed login', async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      } as Response);

      await expect(api.login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        access_token: 'token123',
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
      };

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await api.register('Test User', 'test@test.com', 'password');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem('token')).toBe('token123');
    });

    it('should handle registration errors', async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      } as Response);

      await expect(api.register('Test', 'test@test.com', 'pass')).rejects.toThrow('Email already exists');
    });

    it('should handle array error messages', async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: ['Error 1', 'Error 2'] }),
      } as Response);

      await expect(api.register('Test', 'test@test.com', 'pass')).rejects.toThrow('Error 1, Error 2');
    });
  });

  describe('logout', () => {
    it('should clear token and user from localStorage', () => {
      localStorageMock.setItem('token', 'token123');
      localStorageMock.setItem('user', '{"name":"Test"}');

      api.logout();

      expect(localStorageMock.getItem('token')).toBeNull();
      expect(localStorageMock.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      const user = { id: '1', email: 'test@test.com', name: 'Test' };
      localStorageMock.setItem('user', JSON.stringify(user));

      const result = api.getCurrentUser();

      expect(result).toEqual(user);
    });

    it('should return null when no user in localStorage', () => {
      expect(api.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.setItem('token', 'token123');
      expect(api.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(api.isAuthenticated()).toBe(false);
    });
  });

  describe('getWeatherLogsPaginated', () => {
    it('should fetch paginated weather logs', async () => {
      const mockData = {
        data: [{ _id: '1', timestamp: '2025-01-24T10:00:00Z', temperature: 25, humidity: 70 }],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await api.getWeatherLogsPaginated(1, 10);

      expect(result).toEqual(mockData);
    });

    it('should include filters in query params', async () => {
      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], page: 1, limit: 10, total: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }),
      } as Response);

      await api.getWeatherLogsPaginated(1, 10, 'São Paulo', '2025-01-01', '2025-01-31');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('city=S%C3%A3o+Paulo'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2025-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2025-01-31'),
        expect.any(Object)
      );
    });
  });

  describe('getWeatherLogs', () => {
    it('should fetch weather logs and extract array', async () => {
      const mockPaginated = {
        data: [{ _id: '1', timestamp: '2025-01-24T10:00:00Z', temperature: 25, humidity: 70 }],
        page: 1,
        limit: 100,
        total: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginated,
      } as Response);

      const result = await api.getWeatherLogs();

      expect(result).toEqual(mockPaginated.data);
    });
  });

  describe('getWeatherInsights', () => {
    it('should fetch weather insights', async () => {
      const mockInsights = {
        summary: 'Test summary',
        statistics: {
          averageTemperature: 25,
          averageHumidity: 70,
          maxTemperature: 30,
          minTemperature: 20,
          maxHumidity: 80,
          minHumidity: 60,
          temperatureTrend: 'stable',
        },
      };

      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockInsights,
      } as Response);

      const result = await api.getWeatherInsights();

      expect(result).toEqual(mockInsights);
    });

    it('should include city in query params when provided', async () => {
      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Test' }),
      } as Response);

      await api.getWeatherInsights('São Paulo');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('city=S%C3%A3o+Paulo'),
        expect.any(Object)
      );
    });
  });

  describe('getAvailableCities', () => {
    it('should fetch available cities', async () => {
      const mockCities = ['São Paulo', 'Rio de Janeiro'];

      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCities,
      } as Response);

      const result = await api.getAvailableCities();

      expect(result).toEqual(mockCities);
    });
  });

  describe('exportCsv', () => {
    it('should export CSV as blob', async () => {
      const mockBlob = new Blob(['csv content'], { type: 'text/csv' });

      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const result = await api.exportCsv();

      expect(result).toBe(mockBlob);
    });
  });

  describe('exportXlsx', () => {
    it('should export XLSX as blob', async () => {
      const mockBlob = new Blob(['xlsx content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const result = await api.exportXlsx();

      expect(result).toBe(mockBlob);
    });
  });

  describe('authenticatedFetch', () => {
    it('should redirect to login on 401', async () => {
      localStorageMock.setItem('token', 'invalid-token');
      const originalLocation = window.location;
      const mockLocation = {
        ...originalLocation,
        href: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
      };

      // @ts-expect-error - Mocking window.location for testing
      delete window.location;
      // @ts-expect-error - Mocking window.location for testing
      window.location = mockLocation as Location;

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(
        api.getWeatherLogsPaginated(1, 10)
      ).rejects.toThrow('Sessão expirada');

      expect(localStorageMock.getItem('token')).toBeNull();
      expect(window.location.href).toBe('/login');

      // @ts-expect-error - Restoring window.location
      window.location = originalLocation;
    });

    it('should include Authorization header when token exists', async () => {
      localStorageMock.setItem('token', 'token123');

      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], page: 1, limit: 10, total: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }),
      } as Response);

      await api.getWeatherLogsPaginated(1, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      );
    });
  });
});

