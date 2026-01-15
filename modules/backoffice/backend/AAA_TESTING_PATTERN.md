# AAA Testing Pattern (Arrange-Act-Assert)

## Overview

All tests in this project follow the **AAA (Arrange-Act-Assert)** pattern, a widely-adopted structure that makes tests clear, readable, and maintainable.

---

## What is AAA?

The AAA pattern divides each test into three distinct phases:

```
┌─────────────────────────────────────────────────────┐
│ 1. ARRANGE                                          │
│    Set up the test data and preconditions          │
│    "Given..."                                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. ACT                                              │
│    Execute the code under test                      │
│    "When..."                                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. ASSERT                                           │
│    Verify the outcome matches expectations          │
│    "Then..."                                        │
└─────────────────────────────────────────────────────┘
```

---

## Benefits of AAA

### ✅ **Clarity**
Each test phase has a clear purpose, making tests easy to understand at a glance.

### ✅ **Consistency**
All tests follow the same structure, reducing cognitive load when reading tests.

### ✅ **Maintainability**
When a test fails, you can quickly identify which phase is problematic.

### ✅ **Documentation**
The structure serves as living documentation of expected behavior.

---

## AAA in Backend Integration Tests

### Example 1: Basic Success Case

```typescript
describe('POST /auth/register', () => {
  it('should register new user successfully', async () => {
    // ==========================================
    // ARRANGE: Prepare test data
    // ==========================================
    const dto = TestDataFactory.createRegisterDto();
    
    // ==========================================
    // ACT: Execute the operation
    // ==========================================
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto)
      .expect(201);

    // ==========================================
    // ASSERT: Verify the results
    // ==========================================
    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      user: {
        id: expect.any(String),
        email: dto.email,
        name: dto.name,
        role: 'ROLE_USER',
      },
    });
  });
});
```

**Breakdown**:
- **Arrange**: Create test data with `TestDataFactory`
- **Act**: Make HTTP POST request to `/auth/register`
- **Assert**: Verify response structure and content

---

### Example 2: Testing Validation (Act & Assert Combined)

```typescript
it('should reject invalid email format', async () => {
  // ==========================================
  // ARRANGE: Prepare invalid test data
  // ==========================================
  const dto = TestDataFactory.createRegisterDto({ 
    email: 'invalid-email' 
  });
  
  // ==========================================
  // ACT & ASSERT: Request should fail
  // ==========================================
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto)
    .expect(400);  // Assert: Status code should be 400
});
```

**Note**: When testing error cases, Act and Assert are often combined. The `.expect(400)` is both the action and the assertion.

---

### Example 3: Testing Business Rules (Multiple Actions)

```typescript
it('should prevent duplicate email', async () => {
  // ==========================================
  // ARRANGE: Prepare test data
  // ==========================================
  const dto = TestDataFactory.createRegisterDto();
  
  // ==========================================
  // ACT 1: First registration (setup)
  // ==========================================
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto)
    .expect(201);

  // ==========================================
  // ACT 2: Second registration (actual test)
  // ASSERT: Should return conflict error
  // ==========================================
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto)
    .expect(409);  // Conflict
});
```

**Note**: Complex tests may have multiple Act steps. The first act sets up the state, the second act is the actual test.

---

### Example 4: Testing Dependencies

```typescript
it('should login with valid credentials', async () => {
  // ==========================================
  // ARRANGE: Create user account
  // ==========================================
  const registerDto = TestDataFactory.createRegisterDto();
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(registerDto)
    .expect(201);

  // ==========================================
  // ARRANGE: Prepare login credentials
  // ==========================================
  const loginDto = TestDataFactory.createLoginDto(
    registerDto.email,
    registerDto.password
  );
  
  // ==========================================
  // ACT: Attempt to login
  // ==========================================
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginDto)
    .expect(200);

  // ==========================================
  // ASSERT: Verify login response
  // ==========================================
  expect(response.body).toMatchObject({
    accessToken: expect.any(String),
    user: {
      id: expect.any(String),
      email: registerDto.email,
      name: registerDto.name,
      role: 'ROLE_USER',
    },
  });
});
```

**Note**: In integration tests, setup actions (creating a user) are part of the Arrange phase, even if they involve HTTP requests. The *actual* action being tested is the login.

---

## AAA in Frontend Component Tests

### Example: Testing Form Submission

```typescript
describe('RegisterForm', () => {
  it('submits form successfully', async () => {
    // ==========================================
    // ARRANGE: Setup user interaction utilities
    // ==========================================
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    // ==========================================
    // ACT: Simulate user filling and submitting form
    // ==========================================
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password/i), 'Test123456');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // ==========================================
    // ASSERT: Verify expected outcomes
    // ==========================================
    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });
});
```

---

## AAA in Frontend Hook Tests

### Example: Testing Custom Hook

```typescript
describe('useRegister', () => {
  it('calls register API with correct data', async () => {
    // ==========================================
    // ARRANGE: Render hook and prepare data
    // ==========================================
    const { result } = renderHook(() => useRegister());
    const registerData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Test123456',
    };

    // ==========================================
    // ACT: Call the hook function
    // ==========================================
    await result.current.register(registerData);

    // ==========================================
    // ASSERT: Verify hook state and side effects
    // ==========================================
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(localStorageMock.getItem('accessToken')).toBe('mock-jwt-token');
    });
  });
});
```

---

## When AAA Phases Overlap

### Scenario 1: Simple Error Tests
When testing error cases, Act and Assert often merge:

```typescript
// ❌ Overly verbose
it('should reject invalid input', async () => {
  // Arrange
  const dto = { invalid: 'data' };
  
  // Act
  const response = await request(app.getHttpServer())
    .post('/endpoint')
    .send(dto);
    
  // Assert
  expect(response.status).toBe(400);
});

// ✅ Better: Act and Assert combined
it('should reject invalid input', async () => {
  // Arrange: Prepare invalid data
  const dto = { invalid: 'data' };
  
  // Act & Assert: Request should fail with 400
  await request(app.getHttpServer())
    .post('/endpoint')
    .send(dto)
    .expect(400);
});
```

### Scenario 2: Setup is Part of Arrange
In integration tests, creating dependencies is part of Arrange:

```typescript
it('should allow user to update their profile', async () => {
  // Arrange: Create a user and authenticate
  const user = await createTestUser();
  const token = await getAuthToken(user);
  const updateDto = { name: 'New Name' };
  
  // Act: Update profile
  const response = await request(app.getHttpServer())
    .patch('/profile')
    .set('Authorization', `Bearer ${token}`)
    .send(updateDto)
    .expect(200);
  
  // Assert: Verify update
  expect(response.body.name).toBe('New Name');
});
```

---

## Commenting Convention

### Minimal Comments (For Simple Tests)
```typescript
it('should create item', async () => {
  // Arrange
  const dto = TestDataFactory.createItemDto();
  
  // Act
  const response = await request(app.getHttpServer())
    .post('/items')
    .send(dto)
    .expect(201);

  // Assert
  expect(response.body.id).toBeDefined();
});
```

### Detailed Comments (For Complex Tests)
```typescript
it('should process multi-step workflow', async () => {
  // Arrange: Create user and initial data
  const user = await createTestUser();
  const token = await getAuthToken(user);
  
  // Act: Step 1 - Create order
  const order = await createOrder(token);
  
  // Act: Step 2 - Process payment
  const payment = await processPayment(order.id, token);
  
  // Assert: Verify order is marked as paid
  expect(payment.status).toBe('completed');
  expect(order.isPaid).toBe(true);
});
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Multiple Assertions Without Clear Context
```typescript
it('should work', async () => {
  const dto = TestDataFactory.createDto();
  const response = await request(app.getHttpServer())
    .post('/endpoint')
    .send(dto)
    .expect(201);
    
  expect(response.body.id).toBeDefined();
  expect(response.body.name).toBe('test');
  expect(response.body.active).toBe(true);
  // What are we testing? Not clear!
});
```

### ✅ Fix: Clear AAA Structure
```typescript
it('should create active user with valid data', async () => {
  // Arrange: Prepare test data
  const dto = TestDataFactory.createUserDto({ name: 'test' });
  
  // Act: Create user
  const response = await request(app.getHttpServer())
    .post('/users')
    .send(dto)
    .expect(201);
  
  // Assert: Verify user is created and active
  expect(response.body).toMatchObject({
    id: expect.any(String),
    name: 'test',
    active: true,
  });
});
```

### ❌ Mistake 2: Testing Multiple Things
```typescript
it('should register and login and update profile', async () => {
  // Too much! Split into separate tests
});
```

### ✅ Fix: One Test, One Purpose
```typescript
it('should register new user', async () => { /* ... */ });
it('should login with valid credentials', async () => { /* ... */ });
it('should update user profile', async () => { /* ... */ });
```

### ❌ Mistake 3: No Clear Boundaries
```typescript
it('should work', async () => {
  const dto = TestDataFactory.createDto();
  const response = await request(app.getHttpServer()).post('/endpoint').send(dto);
  expect(response.status).toBe(201);
  expect(response.body.id).toBeDefined();
  const item = await fetchItem(response.body.id);
  expect(item.name).toBe(dto.name);
});
```

### ✅ Fix: Clear AAA Boundaries
```typescript
it('should persist item to database', async () => {
  // Arrange: Prepare test data
  const dto = TestDataFactory.createDto();
  
  // Act: Create item via API
  const response = await request(app.getHttpServer())
    .post('/items')
    .send(dto)
    .expect(201);
  
  // Assert: Verify item was saved to database
  const savedItem = await fetchItem(response.body.id);
  expect(savedItem.name).toBe(dto.name);
});
```

---

## Quick Reference

| Phase | Purpose | Example |
|-------|---------|---------|
| **Arrange** | Set up test data and preconditions | `const dto = TestDataFactory.create()` |
| **Act** | Execute the code under test | `await request().post('/endpoint')` |
| **Assert** | Verify the outcome | `expect(response.body).toMatchObject({...})` |

---

## Summary

The AAA pattern provides:
- ✅ **Structure**: Every test follows the same pattern
- ✅ **Clarity**: Easy to understand what's being tested
- ✅ **Maintainability**: Easy to modify and debug
- ✅ **Documentation**: Tests read like specifications

By consistently applying AAA, our tests become self-documenting and easier to maintain as the codebase grows.
