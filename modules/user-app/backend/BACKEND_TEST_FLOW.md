# Backend Test Flow

This document explains how the backend testing infrastructure works, from initialization to cleanup.

---

## Overview

The backend uses **Jest** as the test runner with a **separate test database** (`testproject_test`) to ensure test isolation. All integration tests run against a real PostgreSQL database with real HTTP requests, but in a completely isolated environment.

---

## Test Flow Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. TEST SUITE STARTS (pnpm test)                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. GLOBAL SETUP (test/setup.ts - beforeAll)                 │
│                                                              │
│  • Set environment variables:                                │
│    - NODE_ENV=test                                          │
│    - DATABASE_URL=postgresql://...testproject_test          │
│    - JWT_SECRET=test-jwt-secret                             │
│                                                              │
│  • Create PrismaService instance (globalPrisma)             │
│  • Connect to test database                                 │
│  • Run migrations: pnpm prisma migrate deploy               │
│    (applies all migrations to testproject_test)             │
│                                                              │
│  ✅ Test database ready!                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TEST FILE EXECUTION (e.g., auth.controller.spec.ts)     │
│                                                              │
│  beforeAll:                                                  │
│  ├─ Call createTestApp()                                    │
│  │  ├─ Create NestJS test module                            │
│  │  ├─ Import AppModule (with all dependencies)             │
│  │  ├─ Apply global pipes (ValidationPipe)                  │
│  │  └─ Initialize application                               │
│  └─ Store app instance for use in tests                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BEFORE EACH TEST (test/setup.ts - beforeEach)           │
│                                                              │
│  • Clean all database tables:                               │
│    - globalPrisma.user.deleteMany()                         │
│    - (add more models as they're created)                   │
│                                                              │
│  ✅ Fresh database state for each test!                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. INDIVIDUAL TEST EXECUTION                                │
│                                                              │
│  Example: "should register new user successfully"           │
│                                                              │
│  1. Create test data:                                       │
│     const dto = TestDataFactory.createRegisterDto()         │
│     // { email: "test-uuid@...", name: "...", password: }   │
│                                                              │
│  2. Make HTTP request using supertest:                      │
│     await request(app.getHttpServer())                      │
│       .post('/auth/register')                               │
│       .send(dto)                                            │
│       .expect(201)                                          │
│                                                              │
│  3. Request flows through full stack:                       │
│     HTTP → Controller → Service → Repository → Database     │
│                                                              │
│  4. Assert response:                                        │
│     expect(response.body).toMatchObject({                   │
│       accessToken: expect.any(String),                      │
│       user: { id, email, name, role }                       │
│     })                                                      │
│                                                              │
│  5. Database state is modified (user created)               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CLEANUP AFTER EACH TEST                                  │
│                                                              │
│  • beforeEach runs again for next test                      │
│  • All tables are truncated                                 │
│  • Database returns to pristine state                       │
│                                                              │
│  ↻ Loop back to step 5 for next test                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. TEST FILE CLEANUP (afterAll in test file)               │
│                                                              │
│  • Close NestJS application: app.close()                    │
│  • Release resources                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. GLOBAL CLEANUP (test/setup.ts - afterAll)               │
│                                                              │
│  • Drop entire public schema: DROP SCHEMA public CASCADE    │
│  • Recreate empty schema: CREATE SCHEMA public              │
│  • Disconnect from database: globalPrisma.$disconnect()     │
│                                                              │
│  ✅ Test database completely clean for next run!            │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Breakdown

### 1. Test Configuration (`jest.config.ts`)

```typescript
{
  testRegex: '.*\\.spec\\.ts$',           // Find all .spec.ts files
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],  // Run global setup
  testEnvironment: 'node',                // Node environment (not browser)
}
```

**Purpose**: Tells Jest where to find tests and what setup to run.

---

### 2. Global Test Setup (`test/setup.ts`)

**Lifecycle Hooks**:

#### `beforeAll` (Runs once before all tests)
```typescript
1. Set environment variables for test mode
2. Create PrismaService instance
3. Connect to testproject_test database
4. Run migrations (execSync: prisma migrate deploy)
```

**Why?** Ensures the test database exists and has the correct schema before any tests run.

#### `beforeEach` (Runs before every test)
```typescript
1. Delete all records from all tables
   - await globalPrisma.user.deleteMany()
   - Respects foreign key constraints
```

**Why?** Each test starts with a clean slate, preventing test pollution.

#### `afterAll` (Runs once after all tests)
```typescript
1. Drop the entire public schema (CASCADE)
2. Recreate an empty public schema
3. Disconnect from database
```

**Why?** Leaves the test database in a pristine state for the next test run.

---

### 3. Test Utilities

#### `test/utils/test-app.factory.ts`
```typescript
export async function createTestApp(): Promise<INestApplication> {
  // 1. Create NestJS testing module
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],  // Full application
  }).compile();

  // 2. Create application instance
  const app = moduleFixture.createNestApplication();
  
  // 3. Apply same configuration as production
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // 4. Initialize
  await app.init();
  
  return app;
}
```

**Purpose**: Creates a real NestJS application instance for integration testing.

**Key Points**:
- Uses the **actual AppModule** (not mocked)
- Applies the **same configuration** as production
- Creates a **full application** with all dependencies
- Returns an instance that can handle **real HTTP requests**

#### `test/utils/test-data.factory.ts`
```typescript
export class TestDataFactory {
  static createRegisterDto(overrides?) {
    return {
      email: `test-${randomUUID()}@example.com`,  // Unique email
      name: 'Test User',
      password: 'Test123456',
      ...overrides,
    };
  }

  static createLoginDto(email, password = 'Test123456') {
    return { email, password };
  }
}
```

**Purpose**: Generates valid test data with unique values.

**Key Points**:
- **UUIDs** ensure no conflicts between tests
- **Overrides** allow customization per test
- **Defaults** provide sensible values

---

### 4. Integration Test Anatomy

```typescript
describe('Auth Controller (Integration)', () => {
  let app: INestApplication;

  // ==========================================
  // SETUP: Create application once
  // ==========================================
  beforeAll(async () => {
    app = await createTestApp();
  });

  // ==========================================
  // TEARDOWN: Close application
  // ==========================================
  afterAll(async () => {
    await app.close();
  });

  // ==========================================
  // ACTUAL TESTS
  // ==========================================
  describe('POST /auth/register', () => {
    it('should register new user successfully', async () => {
      // 1. Arrange: Create test data
      const dto = TestDataFactory.createRegisterDto();
      
      // 2. Act: Make HTTP request
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);  // Assert status code

      // 3. Assert: Verify response
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

    it('should reject duplicate email', async () => {
      const dto = TestDataFactory.createRegisterDto();
      
      // First registration (succeeds)
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      // Second registration with same email (fails)
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(409);  // Conflict
    });
  });
});
```

---

## Request Flow in Tests

When you call `request(app.getHttpServer()).post('/auth/register')`:

```text
┌─────────────┐
│  Test Code  │
│             │
│  request()  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│  Supertest               │
│  (HTTP client library)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  NestJS HTTP Server      │
│  (Express under hood)    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Global Pipes            │
│  (ValidationPipe)        │
│  • Validates DTO         │
│  • Transforms data       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Auth Controller         │
│  @Post('register')       │
│  async register(@Body)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  RegisterUserService     │
│  (Domain Use Case)       │
│  • Validates email       │
│  • Checks for duplicate  │
│  • Creates user entity   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  UserPrismaRepository    │
│  • Converts to Prisma    │
│  • Saves to DB           │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  PostgreSQL              │
│  testproject_test DB     │
│  • INSERT INTO users     │
└──────┬───────────────────┘
       │
       ▼ (response flows back up)
┌──────────────────────────┐
│  Test Code               │
│  • Receives response     │
│  • Asserts expectations  │
└──────────────────────────┘
```

---

## Database Isolation Strategy

### Why Separate Database?

| Aspect | Development DB | Test DB |
|--------|---------------|---------|
| **Name** | `testproject` | `testproject_test` |
| **Purpose** | Development work | Automated tests |
| **Data** | Persistent | Ephemeral |
| **Can be destroyed?** | ❌ No | ✅ Yes (after each run) |
| **Migrations** | Manual | Automatic |

### Cleanup Strategy

**Between Tests** (beforeEach):
```sql
-- Fast: Just delete records
DELETE FROM users;  -- Prisma: user.deleteMany()
```

**After Test Suite** (afterAll):
```sql
-- Nuclear: Destroy and recreate schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

**Why both?**
- `deleteMany()` is **fast** for cleanup between tests
- `DROP SCHEMA` ensures **no leftover migrations** or schema drift

---

## Environment Variables in Tests

```typescript
// test/setup.ts sets these BEFORE any test runs:

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://...testproject_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '7d';
```

**Effect**:
- All services use the **test database**
- JWT tokens use **predictable secret**
- Application knows it's in **test mode**

---

## Key Advantages

### ✅ Real Integration Testing
- Tests the **entire stack** (HTTP → Controller → Service → Repository → Database)
- No mocking of core business logic
- Catches integration issues that unit tests miss

### ✅ Test Isolation
- Each test starts with **clean database**
- Tests can run in **any order**
- No test pollution or flakiness

### ✅ Fast Feedback
- Setup runs **once** per test suite
- Individual tests are **fast** (50-100ms)
- Cleanup is **automatic**

### ✅ Production-Like
- Uses **same code** as production
- **Same validation** rules
- **Same error handling**
- Only difference: database name

### ✅ Type Safety
- Uses **generated types** from OpenAPI
- TypeScript catches **type mismatches**
- Refactoring is **safe**

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test auth.controller.spec.ts

# Run with coverage
pnpm test:cov

# Run in watch mode (for development)
pnpm test:watch
```

---

## Common Test Patterns

### Pattern 1: Testing Success Case (AAA Pattern)
```typescript
it('should create resource', async () => {
  // Arrange: Prepare test data
  const dto = TestDataFactory.createDto();
  
  // Act: Execute the operation
  const response = await request(app.getHttpServer())
    .post('/endpoint')
    .send(dto)
    .expect(201);

  // Assert: Verify the results
  expect(response.body).toMatchObject({
    id: expect.any(String),
    // ... other fields
  });
});
```

**AAA Pattern Explained**:
- **Arrange**: Set up test data, create objects, prepare state
- **Act**: Execute the code under test (make the HTTP request)
- **Assert**: Verify the outcome matches expectations

### Pattern 2: Testing Validation (AAA Pattern)
```typescript
it('should reject invalid input', async () => {
  // Arrange: Prepare invalid test data
  const dto = { invalid: 'data' };
  
  // Act & Assert: Request should fail with 400 Bad Request
  await request(app.getHttpServer())
    .post('/endpoint')
    .send(dto)
    .expect(400);
});
```

**Note**: Sometimes Act and Assert are combined when testing error cases with `.expect(statusCode)`.

### Pattern 3: Testing Business Rules (AAA Pattern)
```typescript
it('should prevent duplicate email', async () => {
  // Arrange: Create test data
  const dto = TestDataFactory.createRegisterDto();
  
  // Act: First registration (succeeds)
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto)
    .expect(201);

  // Act & Assert: Second registration with same email (fails)
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto)
    .expect(409);  // Conflict
});
```

**Note**: Tests with multiple actions may have multiple Act steps, but each leads to its own assertion.

### Pattern 4: Testing Dependencies (AAA Pattern)
```typescript
it('should login after registration', async () => {
  // Arrange: Register a user to create valid credentials
  const registerDto = TestDataFactory.createRegisterDto();
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(registerDto)
    .expect(201);

  // Arrange: Prepare login credentials
  const loginDto = TestDataFactory.createLoginDto(
    registerDto.email,
    registerDto.password
  );
  
  // Act & Assert: Login should succeed
  await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginDto)
    .expect(200);
});
```

**Note**: In integration tests, setup actions (like creating a user) are part of the Arrange phase, even if they make HTTP requests.

---

## Troubleshooting

### Database Connection Errors
```
PrismaClientInitializationError: Database `testproject_test` does not exist
```

**Solution**: Create the test database manually:
```bash
docker exec testproject_postgres psql -U postgres -c "CREATE DATABASE testproject_test;"
```

### Migration Errors
```
P3009: migrate.lock file exists
```

**Solution**: Clean migrations and re-run:
```bash
pnpm prisma migrate reset --force
```

### Timeout Errors
```
Exceeded timeout of 5000 ms for test
```

**Solution**: Increase timeout for slow tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000);  // 10 second timeout
```

---

## Best Practices

### ✅ DO
- **Follow AAA Pattern**: Arrange, Act, Assert (use comments to make it clear)
- Use `TestDataFactory` for consistent test data
- Clean up after each test (automatic via `beforeEach`)
- Test one thing per test
- Use descriptive test names
- Test both success and failure cases
- Keep assertions focused and specific

### ❌ DON'T
- Don't use development database for tests
- Don't skip cleanup (let `beforeEach` handle it)
- Don't mock Prisma or repositories in integration tests
- Don't share data between tests
- Don't make tests order-dependent

---

## Summary

The backend test flow ensures:
1. **Isolated environment** (separate database)
2. **Clean state** (beforeEach cleanup)
3. **Real integration** (full stack testing)
4. **Fast execution** (optimized setup/teardown)
5. **Type safety** (TypeScript + generated types)

All tests run against a real database with real HTTP requests, providing high confidence that the application works as expected in production.
