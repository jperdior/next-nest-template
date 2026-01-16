import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/features/auth/presentation/components/RegisterForm';
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

describe('RegisterForm', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  it('renders all form fields', () => {
    render(<RegisterForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates name is required', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
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
    render(<RegisterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm password/i), 'Different123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
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
    
    server.use(
      rest.post('http://localhost:3001/auth/register', async (req, res, ctx) => {
        // Add small delay to make loading state observable
        return res(
          ctx.delay(100),
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
    render(<RegisterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456!');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('displays API errors', async () => {
    // Override MSW handler for this test
    const { server } = await import('../../../mocks/server');
    const { rest } = await import('msw');
    
    server.use(
      rest.post('http://localhost:3001/auth/register', (req, res, ctx) => {
        return res(
          ctx.status(409),
          ctx.json({ message: 'Email already exists' })
        );
      })
    );

    const user = userEvent.setup();
    render(<RegisterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456!');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });

  it('has link to login page', () => {
    render(<RegisterForm />);
    
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
