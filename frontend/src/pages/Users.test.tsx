import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import Users from './Users';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUsers = [
  {
    _id: '1',
    email: 'user1@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    email: 'user2@example.com',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
];

describe('Users Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  it('renders user management title', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  it('fetches and displays users on mount', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/user1@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/user2@example.com/)).toBeInTheDocument();
    });
  });

  it('renders create user form', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  it('creates a new user successfully', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
    mockedAxios.post.mockResolvedValue({ data: { _id: '3', email: 'newuser@example.com' } });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const createButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        {
          email: 'newuser@example.com',
          password: 'password123',
        },
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        })
      );
    });

    // Form should be cleared
    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  it('displays existing users section', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Existing Users')).toBeInTheDocument();
    });
  });

  it('displays user creation dates', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      const date1 = new Date('2024-01-01T00:00:00.000Z').toLocaleDateString();
      const date2 = new Date('2024-01-15T00:00:00.000Z').toLocaleDateString();
      
      expect(screen.getByText(new RegExp(date1))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(date2))).toBeInTheDocument();
    });
  });

  it('handles API error when fetching users', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles API error when creating user', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedAxios.get.mockResolvedValue({ data: [] });
    mockedAxios.post.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const createButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('uses authorization header with token', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        })
      );
    });
  });

  it('refetches users after successful creation', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
    mockedAxios.post.mockResolvedValue({ data: { _id: '3', email: 'newuser@example.com' } });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    // Initial fetch
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const createButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(createButton);

    // Should refetch after creation
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
