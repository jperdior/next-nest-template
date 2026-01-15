import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/features/auth/presentation/components/RegisterForm';

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
    
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
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
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
  });

  it('displays API errors', async () => {
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

    const user = userEvent.setup();
    render(<RegisterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456');
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
