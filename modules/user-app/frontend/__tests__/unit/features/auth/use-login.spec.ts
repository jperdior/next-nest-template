import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from '@/features/auth/application/hooks/use-login';
import { createLocalStorageMock } from '../../../utils/create-localstorage-mock';

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
    const { result } = renderHook(() => useLogin());

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
    const { result } = renderHook(() => useLogin());

    expect(result.current.isLoading).toBe(false);

    const loginPromise = result.current.login({
      email: 'test@example.com',
      password: 'Test123456!',
    });

    // Should be loading immediately after calling login
    expect(result.current.isLoading).toBe(true);

    await loginPromise;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('stores JWT token in localStorage on success', async () => {
    const { result } = renderHook(() => useLogin());

    await result.current.login({
      email: 'test@example.com',
      password: 'Test123456!',
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });

  it('stores user data in localStorage on success', async () => {
    const { result } = renderHook(() => useLogin());

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
    const { result } = renderHook(() => useLogin());

    await result.current.login({
      email: 'test@example.com',
      password: 'Test123456!',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('sets error state on failure', async () => {
    const { result } = renderHook(() => useLogin());

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
    const { result } = renderHook(() => useLogin());

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
      rest.post('http://localhost:3001/auth/login', (req, res, ctx) => {
        return res.networkError('Network error');
      })
    );

    const { result } = renderHook(() => useLogin());

    try {
      await result.current.login({
        email: 'test@example.com',
        password: 'Test123456!',
      });
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
