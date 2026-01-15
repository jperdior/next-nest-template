import { renderHook, waitFor } from '@testing-library/react';
import { useRegister } from '@/features/auth/application/hooks/use-register';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useRegister', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  it('calls register API with correct data', async () => {
    const { result } = renderHook(() => useRegister());

    const registerData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
    };

    await result.current.register(registerData);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sets loading state during request', async () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.isLoading).toBe(false);

    const registerPromise = result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
    });

    // Should be loading immediately after calling register
    expect(result.current.isLoading).toBe(true);

    await registerPromise;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('stores JWT token in localStorage on success', async () => {
    const { result } = renderHook(() => useRegister());

    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });

  it('stores user data in localStorage on success', async () => {
    const { result } = renderHook(() => useRegister());

    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
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
    const { result } = renderHook(() => useRegister());

    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('sets error state on failure', async () => {
    // Override MSW handler for this test
    const { server } = await import('../../../mocks/server');
    const { http, HttpResponse } = await import('msw');
    
    server.use(
      http.post('http://localhost:3001/auth/register', () => {
        return HttpResponse.json(
          { message: 'Email already exists' },
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useRegister());

    try {
      await result.current.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123456',
      });
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles network errors gracefully', async () => {
    // Override MSW handler to simulate network error
    const { server } = await import('../../../mocks/server');
    const { http, HttpResponse } = await import('msw');
    
    server.use(
      http.post('http://localhost:3001/auth/register', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useRegister());

    try {
      await result.current.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123456',
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
