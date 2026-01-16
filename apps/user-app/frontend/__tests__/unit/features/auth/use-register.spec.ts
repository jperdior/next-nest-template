import { renderHook, waitFor, act } from '@testing-library/react';
import { useRegister } from '@/features/auth/application/hooks/use-register';
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

describe('useRegister', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  afterEach(async () => {
    const { server } = await import('../../../mocks/server');
    server.resetHandlers();
  });

  it('completes registration and sets loading to false', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    const registerData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456!',
    };

    await result.current.register(registerData);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sets loading state during request', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    expect(result.current.isLoading).toBe(false);

    let registerPromise: Promise<void>;
    act(() => {
      registerPromise = result.current.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123456!',
      });
    });

    // Should be loading immediately after calling register
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      await registerPromise!;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('stores JWT token in localStorage on success', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456!',
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });

  it('stores user data in localStorage on success', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
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
    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456!',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('sets error state on failure', async () => {
    // Override MSW handler for this test
    const { server } = await import('../../../mocks/server');
    const { rest } = await import('msw');
    
    server.use(
      rest.post(`${API_URL}/auth/register`, (_req, res, ctx) => {
        return res(
          ctx.status(409),
          ctx.json({ message: 'Email already exists' })
        );
      })
    );

    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    // Call register - it will fail with 409
    let registerPromise: Promise<void>;
    act(() => {
      registerPromise = result.current.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123456!',
      });
    });

    // Wait for the register promise to complete
    await act(async () => {
      await registerPromise;
    });

    // Error should be set after the call completes
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles network errors gracefully', async () => {
    // Override MSW handler to simulate network error
    const { server } = await import('../../../mocks/server');
    const { rest } = await import('msw');
    
    server.use(
      rest.post(`${API_URL}/auth/register`, (_req, res) => {
        return res.networkError('Network error');
      })
    );

    const { result } = renderHook(() => useRegister(), { wrapper: TestWrapper });

    // Call register - it will fail with network error
    let registerPromise: Promise<void>;
    act(() => {
      registerPromise = result.current.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123456!',
      });
    });

    // Wait for the register promise to complete
    await act(async () => {
      await registerPromise;
    });

    // Error should be set after the call completes
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
