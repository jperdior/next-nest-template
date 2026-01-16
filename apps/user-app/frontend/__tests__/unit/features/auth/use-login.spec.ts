import { renderHook, waitFor, act } from '@testing-library/react';
import { useLogin } from '@/features/auth/application/hooks/use-login';
import { createLocalStorageMock } from '../../../utils/create-localstorage-mock';
import { TestWrapper } from '../../../utils/test-wrapper';

// Use the same API URL as the handlers
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock localStorage
const localStorageMock = createLocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLogin', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  afterEach(async () => {
    const { server } = await import('../../../mocks/server');
    server.resetHandlers();
  });

  it('completes login and sets loading to false', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    const loginData = {
      email: 'test@example.com',
      password: 'Test123456!',
    };

    await result.current.login(loginData);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sets loading state during request', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    expect(result.current.isLoading).toBe(false);

    let loginPromise: Promise<void>;
    act(() => {
      loginPromise = result.current.login({
        email: 'test@example.com',
        password: 'Test123456!',
      });
    });

    // Should be loading immediately after calling login
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      await loginPromise!;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('stores JWT token in localStorage on success', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    await result.current.login({
      email: 'test@example.com',
      password: 'Test123456!',
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });

  it('stores user data in localStorage on success', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    await result.current.login({
      email: 'test@example.com',
      password: 'Test123456!',
    });

    await waitFor(() => {
      const userData = localStorageMock.getItem('user');
      expect(userData).toBeTruthy();
      const user = JSON.parse(userData!);
      expect(user).toMatchObject({
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ROLE_USER',
      });
    });
  });

  it('redirects to home on success', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    await result.current.login({
      email: 'test@example.com',
      password: 'Test123456!',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('sets error state on failure', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    try {
      await result.current.login({
        email: 'wrong@example.com',
        password: 'WrongPassword',
      });
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles 401 unauthorized', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    try {
      await result.current.login({
        email: 'test@example.com',
        password: 'WrongPassword123',
      });
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toMatch(/invalid credentials/i);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles network errors gracefully', async () => {
    // Override MSW handler to simulate network error
    const { server } = await import('../../../mocks/server');
    const { rest } = await import('msw');
    
    server.use(
      rest.post(`${API_URL}/auth/login`, (_req, res) => {
        return res.networkError('Network error');
      })
    );

    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    // Call login - it will throw due to network error
    let loginPromise: Promise<void>;
    act(() => {
      loginPromise = result.current.login({
        email: 'test@example.com',
        password: 'Test123456!',
      });
    });

    // Wait for the login promise to reject and state to update
    await act(async () => {
      try {
        await loginPromise;
      } catch {
        // Expected to throw
      }
    });

    // Error should be set after the call completes
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
