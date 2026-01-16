import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/features/auth/presentation/components/LoginForm';
import { createLocalStorageMock } from '../../../utils/create-localstorage-mock';
import { testWrapperOptions } from '../../../utils/test-wrapper';

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

describe('LoginForm', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  it('renders email and password fields', () => {
    render(<LoginForm />, testWrapperOptions);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, testWrapperOptions);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates password is required', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, testWrapperOptions);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('submits form successfully with valid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123456!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });

  it('disables submit button while loading', async () => {
    // Add delay to MSW handler to make loading state observable
    const { server } = await import('../../../mocks/server');
    const { rest } = await import('msw');
    
    let resolveRequest: () => void;
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });
    
    server.use(
      rest.post(`${API_URL}/auth/login`, async (_req, res, ctx) => {
        // Wait for the test to allow the request to proceed
        await requestPromise;
        return res(
          ctx.json({
            accessToken: 'mock-jwt-token',
            user: {
              id: 'mock-user-id',
              email: 'test@example.com',
              name: 'Test User',
              role: 'ROLE_USER',
            },
          })
        );
      })
    );

    const user = userEvent.setup();
    render(<LoginForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123456!');
    
    // Start clicking - don't await
    const clickPromise = user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Button should show loading text and be disabled during submission
    const loadingButton = await screen.findByRole('button', { name: /signing in/i });
    expect(loadingButton).toBeDisabled();
    
    // Allow request to complete
    resolveRequest!();
    await clickPromise;
  });

  it('displays API error for invalid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('has link to register page', () => {
    render(<LoginForm />, testWrapperOptions);
    
    const registerLink = screen.getByRole('link', { name: /create one/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('redirects to home on successful login', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123456!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
