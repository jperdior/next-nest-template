import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/features/auth/presentation/components/RegisterForm';
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

describe('RegisterForm', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  it('renders all form fields', () => {
    render(<RegisterForm />, testWrapperOptions);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, testWrapperOptions);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates name is required', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, testWrapperOptions);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'weak');
    await user.type(screen.getByLabelText(/confirm password/i), 'weak');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Zod shows one error at a time, check for any password validation error
    const errorText = await screen.findByText(/password must/i);
    expect(errorText).toBeInTheDocument();
  });

  it('validates passwords match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm password/i), 'Different123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456!');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
      expect(mockPush).toHaveBeenCalledWith('/');
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
      rest.post(`${API_URL}/auth/register`, async (_req, res, ctx) => {
        // Wait for the test to allow the request to proceed
        await requestPromise;
        return res(
          ctx.status(201),
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
    render(<RegisterForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456!');
    
    // Start clicking - don't await
    const clickPromise = user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Button should show loading text and be disabled during submission
    const loadingButton = await screen.findByRole('button', { name: /creating account/i });
    expect(loadingButton).toBeDisabled();
    
    // Allow request to complete
    resolveRequest!();
    await clickPromise;
  });

  it('displays API errors', async () => {
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

    const user = userEvent.setup();
    render(<RegisterForm />, testWrapperOptions);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456!');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(await screen.findByText(/API request failed.*email already exists/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('has link to login page', () => {
    render(<RegisterForm />, testWrapperOptions);
    
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
