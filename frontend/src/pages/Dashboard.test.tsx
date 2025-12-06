import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import Dashboard from './Dashboard';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div>Line</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
}));

const mockWeatherLogs = [
  {
    city: 'São Paulo',
    temperature: 25.5,
    humidity: 65,
    windSpeed: 12.3,
    condition: 'Partly Cloudy',
    timestamp: Math.floor(Date.now() / 1000),
  },
];

const mockInsights = {
  insight: 'Weather is stable',
  averageTemp: 25.5,
};

const mockConfig = {
  _id: '123',
  city: 'São Paulo',
  latitude: '-23.5505',
  longitude: '-46.6333',
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => 
        success({
          coords: {
            latitude: -23.5505,
            longitude: -46.6333,
          },
        })
      ),
      watchPosition: vi.fn(),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
    
    mockedAxios.put.mockResolvedValue({ data: {} });
  });

  it('renders dashboard title', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
    });
  });


  it('fetches and displays weather data', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/weather/logs')) {
        return Promise.resolve({ data: mockWeatherLogs });
      }
      if (url.includes('/weather/insights')) {
        return Promise.resolve({ data: mockInsights });
      }
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('25.5°C')[0]).toBeInTheDocument();
      expect(screen.getAllByText('65%')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Partly Cloudy')[0]).toBeInTheDocument();
    });
  });

  it('displays AI insights when available', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/weather/logs')) {
        return Promise.resolve({ data: mockWeatherLogs });
      }
      if (url.includes('/weather/insights')) {
        return Promise.resolve({ data: mockInsights });
      }
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AI Insight')).toBeInTheDocument();
      expect(screen.getByText('Weather is stable')).toBeInTheDocument();
      expect(screen.getByText('Average Temperature: 25.5°C')).toBeInTheDocument();
    });
  });

  it('renders export buttons', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTitle('Export CSV')).toBeInTheDocument();
      expect(screen.getByTitle('Export XLSX')).toBeInTheDocument();
    });
  });

  it('renders manage users button', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTitle('Manage Users')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('uses authorization header with token', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/weather/logs'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        })
      );
    });
  });

  it('displays temperature trend chart', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/weather/logs')) {
        return Promise.resolve({ data: mockWeatherLogs });
      }
      if (url.includes('/weather/insights')) {
        return Promise.resolve({ data: mockInsights });
      }
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockConfig });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Temperature Trend')).toBeInTheDocument();
    });
  });
});
