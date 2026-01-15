# Frontend Testing Guide

**⚠️ REQUIRED READING**: This document MUST be read before implementing any feature. Tests are not optional - they are developed **alongside** features, not after.

---

## Core Principle: Tests Are Part of Every Feature

**🚨 CRITICAL**: When you develop a feature, you MUST develop its tests simultaneously. This is non-negotiable.

### The Development Flow

```
┌─────────────────────────────────────────────────────────────┐
│                FRONTEND FEATURE DEVELOPMENT                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Domain Layer (Optional)                                  │
│     ├─ Create Zod schemas for validation                    │
│     └─ Write validation tests ← IF NEEDED                   │
│                                                               │
│  2. Infrastructure Layer                                     │
│     ├─ Create API client functions                          │
│     └─ Covered by MSW mocks                                 │
│                                                               │
│  3. Application Layer                                        │
│     ├─ Create custom hooks (useRegister, useLogin, etc.)   │
│     └─ Write hook tests ← IMMEDIATELY                       │
│                                                               │
│  4. Presentation Layer                                       │
│     ├─ Create UI components                                 │
│     └─ Write component tests ← IMMEDIATELY                  │
│                                                               │
│  ✅ Feature is DONE only when code + tests are complete     │
└─────────────────────────────────────────────────────────────┘
```

---

## Test Types

### 1. Component Tests
**Purpose**: Test UI rendering, user interactions, and component behavior

**What to Test**:
- Component renders with correct content
- User interactions work (clicks, typing, form submission)
- Conditional rendering works
- Error states display correctly
- Loading states display correctly

**Example**:
```typescript
// Arrange-Act-Assert Pattern
describe('LoginForm', () => {
  it('submits form with valid credentials', async () => {
    // Arrange: Setup user interaction utilities
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Act: Simulate user actions
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert: Verify expected outcomes
    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });
});
```

### 2. Hook Tests
**Purpose**: Test custom hook logic and state management

**What to Test**:
- Hook returns correct initial state
- Hook functions work correctly
- Hook handles API calls properly
- Hook updates state on success/error
- Hook handles loading states

**Example**:
```typescript
describe('useRegister', () => {
  it('registers user and stores token', async () => {
    // Arrange: Render hook
    const { result } = renderHook(() => useRegister());
    
    // Act: Call hook function
    await result.current.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
    });
    
    // Assert: Verify state and side effects
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeDefined();
    });
  });
});
```

### 3. Integration Tests (with MSW)
**Purpose**: Test entire user flows with mocked API responses

**What to Test**:
- Multi-step workflows
- API error handling
- Navigation flows
- Complex interactions

**Example**:
```typescript
describe('Registration Flow', () => {
  it('completes full registration process', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    // Act: Complete entire flow
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/password/i), 'NewPass123');
    await user.type(screen.getByLabelText(/confirm/i), 'NewPass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Assert: User is registered and redirected
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});
```

---

## AAA Pattern (Arrange-Act-Assert)

**All tests MUST follow the AAA pattern for consistency and clarity.**

### Structure
```typescript
it('should do something', async () => {
  // ==========================================
  // ARRANGE: Set up test data and preconditions
  // ==========================================
  const user = userEvent.setup();
  render(<Component />);
  
  // ==========================================
  // ACT: Execute the code under test
  // ==========================================
  await user.click(screen.getByRole('button'));
  
  // ==========================================
  // ASSERT: Verify the outcome
  // ==========================================
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

**Note**: See backend's `AAA_TESTING_PATTERN.md` for detailed AAA guidelines.

---

## Mock Service Worker (MSW)

We use MSW to mock API calls at the network level.

### Setup

**1. Define Handlers** (`__tests__/mocks/handlers.ts`):
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json();
    
    if (body.email === 'test@example.com' && body.password === 'Test123456') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token',
        user: { id: '1', email: body.email, name: 'Test User', role: 'ROLE_USER' },
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

**2. Setup Server** (`__tests__/mocks/server.ts`):
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**3. Jest Setup** (`jest.setup.ts`):
```typescript
import { server } from './__tests__/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Override Handlers in Tests
```typescript
it('handles API error', async () => {
  // Override default handler for this test
  server.use(
    http.post('/auth/login', () => {
      return HttpResponse.json(
        { message: 'Server error' },
        { status: 500 }
      );
    })
  );
  
  // Test error handling...
});
```

---

## Testing Patterns

### Pattern 1: Testing Form Validation

```typescript
describe('RegisterForm Validation', () => {
  it('validates email format', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    // Act
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Assert
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
  
  it('validates passwords match', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    // Act
    await user.type(screen.getByLabelText(/^password/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm/i), 'Different123');
    await user.click(screen.getByRole('button'));
    
    // Assert
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
```

### Pattern 2: Testing Loading States

```typescript
describe('LoadingStates', () => {
  it('shows loading indicator during API call', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Act: Trigger async operation
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123456');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Assert: Loading state appears
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    
    // Assert: Loading state disappears
    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });
});
```

### Pattern 3: Testing Error Handling

```typescript
describe('ErrorHandling', () => {
  it('displays API error message', async () => {
    // Arrange: Setup to return error
    server.use(
      http.post('/auth/login', () => {
        return HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );
    
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Act: Trigger API call that will fail
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'WrongPass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert: Error message is displayed
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

### Pattern 4: Testing Navigation

```typescript
// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('Navigation', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });
  
  it('redirects after successful login', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Act: Complete login
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert: Router.push was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
```

---

## Test Utilities

### Custom Render with Providers

```typescript
// test/utils/test-utils.tsx
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Test Data Factories

```typescript
// test/utils/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'ROLE_USER',
  ...overrides,
});
```

---

## Running Tests

```bash
# From project root (runs in Docker)
make test-fe            # Run all frontend tests

# From inside frontend container (make shell-fe)
pnpm test               # All tests
pnpm test:watch         # Watch mode
pnpm test:cov           # With coverage
pnpm test LoginForm     # Specific test file
```

---

## Coverage Goals

- **Overall**: > 80%
- **Hooks**: > 90% (critical business logic)
- **Components**: > 80%
- **Utils**: > 85%

---

## Best Practices

### ✅ DO

- **Follow AAA Pattern**: Arrange, Act, Assert in every test
- **Test user behavior**: What the user sees and does, not implementation
- **Use semantic queries**: `getByRole`, `getByLabelText`, not `getByTestId`
- **Test error states**: Always test what happens when things fail
- **Mock API calls**: Use MSW, never hit real APIs
- **Keep tests isolated**: Each test should be independent
- **Use descriptive names**: Test names should read like specifications
- **Write tests with features**: Not after, during development

### ❌ DON'T

- **Test implementation details**: Don't test state variables or internal functions
- **Use getByTestId** unless absolutely necessary
- **Skip accessibility**: Use proper ARIA roles and labels
- **Write flaky tests**: Avoid time-dependent assertions
- **Test too much in one test**: One test, one concept
- **Forget cleanup**: Always clean up (localStorage, mocks, etc.)
- **Skip edge cases**: Test validation, errors, empty states

---

## Debugging Tests

### Run Single Test

```bash
pnpm test -t "should submit form"
```

### Debug with Console

```typescript
import { screen, debug } from '@testing-library/react';

it('test', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
});
```

### Increase Timeout

```typescript
it('long test', async () => {
  // Test code
}, 10000); // 10 second timeout
```

---

## Common Issues

### "Unable to find element"

**Problem**: Element not found by query.

**Solution**: 
1. Use `screen.debug()` to see DOM
2. Check if element renders conditionally
3. Use `findBy` for async elements (not `getBy`)
4. Ensure correct ARIA roles and labels

### "Warning: Not wrapped in act(...)"

**Problem**: State update outside of `act()`.

**Solution**: 
1. Use `waitFor()` for async operations
2. Use `await` with `userEvent` methods
3. Let React Testing Library handle `act()` automatically

### "Test times out"

**Problem**: Async operation never completes.

**Solution**:
1. Check MSW handlers are set up correctly
2. Use `screen.findBy` instead of `screen.getBy` for async content
3. Increase timeout: `waitFor(() => ..., { timeout: 5000 })`

---

## Testing Checklist for Every Feature

Before marking a frontend feature as "done", ensure:

- [ ] **Component Tests**: All components have tests for rendering and interactions
- [ ] **Hook Tests**: All custom hooks have tests for state and API calls
- [ ] **AAA Pattern**: All tests follow Arrange-Act-Assert structure
- [ ] **MSW Handlers**: API endpoints are mocked in `handlers.ts`
- [ ] **Error States**: Tests cover API errors and validation errors
- [ ] **Loading States**: Tests verify loading indicators work
- [ ] **Navigation**: Tests verify redirects and routing work
- [ ] **Accessibility**: Tests use semantic queries (`getByRole`, `getByLabelText`)
- [ ] **Coverage**: New code has >80% coverage (hooks >90%)
- [ ] **All Tests Pass**: `pnpm test` runs successfully

---

## Summary

- **Component Tests**: Render, interact, assert on visible output
- **Hook Tests**: Test state management and API integration
- **MSW**: Mock API calls at network level
- **AAA Pattern**: Arrange-Act-Assert in every test
- **Test with features**: Write tests during development, not after
- **High coverage**: >80% overall, >90% for hooks

---

## 🔗 Related Documentation

- **[AGENTS.md](./AGENTS.md)** - Overall development guidelines
- **Backend [AAA_TESTING_PATTERN.md](../backend/AAA_TESTING_PATTERN.md)** - Detailed AAA pattern guide
- **Backend [TESTING.md](../backend/TESTING.md)** - Backend testing patterns

---

**Remember: Write tests as you code, not after. They're your safety net!**
