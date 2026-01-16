# Backend Testing Guide

**⚠️ REQUIRED READING**: This document MUST be read before implementing any feature. Tests are not optional - they are developed **alongside** features, not after.

---

## Core Principle: Tests Are Part of Every Feature

**🚨 CRITICAL**: When you develop a feature, you MUST develop its tests simultaneously. This is non-negotiable.

### Why Test-First Development?

1. **Prevents Technical Debt**: Tests written after the fact are often skipped or rushed
2. **Better Design**: Writing tests first leads to better API design
3. **Catches Bugs Early**: Issues found during development are 10x cheaper to fix
4. **Living Documentation**: Tests serve as executable specifications
5. **Confidence**: You can refactor without fear

### The Development Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE DEVELOPMENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Write Domain Layer                                       │
│     ├─ Create entity/value object                           │
│     └─ Write unit tests ← IMMEDIATELY                       │
│                                                               │
│  2. Write Application Layer                                  │
│     ├─ Create use case service                              │
│     └─ Write unit tests ← IMMEDIATELY                       │
│                                                               │
│  3. Write Infrastructure Layer                               │
│     ├─ Create repository implementation                      │
│     └─ Integration tests cover this                         │
│                                                               │
│  4. Write Presentation Layer                                 │
│     ├─ Create controller/endpoint                           │
│     └─ Write integration tests ← IMMEDIATELY                │
│                                                               │
│  ✅ Feature is DONE only when code + tests are complete     │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Philosophy

- **Test behavior, not implementation** - Verify what code does, not how
- **Fast feedback** - Unit tests < 10ms, integration tests < 1s
- **Confidence** - Catch bugs before production
- **Maintainability** - Easy to understand and update
- **AAA Pattern** - All tests follow Arrange-Act-Assert (see below)

## AAA Pattern (Arrange-Act-Assert)

Every test follows this structure:

```typescript
it('should register a new user', async () => {
  // ==========================================
  // ARRANGE: Set up test data and preconditions
  // ==========================================
  const input = { email: 'test@example.com', password: 'SecurePass123!' };
  
  // ==========================================
  // ACT: Execute the code under test
  // ==========================================
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(input);
  
  // ==========================================
  // ASSERT: Verify the outcome
  // ==========================================
  expect(response.status).toBe(201);
  expect(response.body.email).toBe('test@example.com');
});
```

**Benefits:**
- **Clarity**: Each phase has clear purpose
- **Consistency**: All tests follow same structure
- **Maintainability**: Easy to identify which phase fails

**Use blank lines** to separate AAA phases for readability.

## Test Infrastructure Flow

### How Tests Run

1. **Global Setup** (`test/setup.ts`):
   - Set `NODE_ENV=test`
   - Connect to `testproject_test` database
   - Run migrations

2. **Test File** (`*.spec.ts`):
   - `beforeAll`: Create NestJS test app
   - `beforeEach`: Clean test data
   - Run tests with supertest
   - `afterAll`: Close app

3. **Global Teardown**:
   - Disconnect from database
   - Clean up resources

### Test Database

- **Development**: `testproject` (port 5432)
- **Test**: `testproject_test` (port 5432)
- Automatically migrated before tests run
- Cleaned between tests for isolation

## Test Types

### Unit Tests

**Purpose**: Test individual components in isolation.

**What to Test**:
- Value objects and their validation logic
- Entity business methods
- Domain services
- Use case services (with mocked repositories)

**Location**: `test/unit/context/[feature]/`

**Characteristics**:
- Fast (< 10ms per test)
- No database, no HTTP, no external dependencies
- Use mocks/stubs for dependencies
- Focus on business logic

### Integration Tests

**Purpose**: Test components working together.

**What to Test**:
- HTTP endpoints (controllers)
- Database operations (repositories)
- Full request/response cycle

**Location**: `test/integration/context/[feature]/`

**Characteristics**:
- Slower (100ms - 1s per test)
- Use real database (test database)
- Test actual HTTP requests
- Verify end-to-end behavior

## Test Structure

### Unit Test Pattern

```typescript
describe('ItemName Value Object', () => {
  it('should create valid item name', () => {
    const name = ItemName.create('Valid Name');
    expect(name.getValue()).toBe('Valid Name');
  });

  it('should reject invalid name', () => {
    expect(() => ItemName.create('ab')).toThrow();
  });
});
```

### Integration Test Pattern

```typescript
describe('ItemsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.item.deleteMany();
  });

  it('POST /items should create item', async () => {
    const response = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Test Item' })
      .expect(201);

    expect(response.body.name).toBe('Test Item');
  });
});
```

## Testing by Layer

### Domain Layer (Unit Tests)
- Test entities and value objects
- Test business logic and validation
- No mocks needed (pure functions)

### Application Layer (Unit Tests)
- Test use case services with mocked repositories
- Verify orchestration logic
- Check input/output mapping

### Infrastructure Layer (Integration Tests)
- Test repository implementations
- Usually covered by controller tests

### Presentation Layer (Integration Tests)
- Test HTTP endpoints end-to-end
- See integration test pattern above

## Test Utilities

Use factories for test data:

```typescript
// test/factories/entity.factory.ts
export function createTestEntity(overrides?): Entity {
  return new Entity({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Entity',
    ...overrides,
  });
}
```

**Note**: See `test/utils/test-app.factory.ts` and `test/utils/test-data.factory.ts` for real working test utilities and patterns used in this codebase.

Mock repositories:

```typescript
const mockRepo: jest.Mocked<Repository> = {
  create: jest.fn(),
  findById: jest.fn(),
  // ... other methods
};
```


## Running Tests

```bash
# From project root (runs in Docker)
make test-be            # Run all backend tests

# From inside backend container (make shell-be)
pnpm test               # All tests
pnpm test:watch         # Watch mode
pnpm test item.entity.spec.ts  # Specific file
pnpm test:cov           # With coverage
pnpm test test/integration     # Integration tests only
pnpm test test/unit            # Unit tests only
```

**Note:** For quick test runs, use `make test-be` from the project root. For watch mode or specific test files, use `make shell-be` to open a shell in the container.

## Coverage Goals

- **Overall**: > 80%
- **Domain Layer**: > 95% (critical business logic)
- **Application Layer**: > 90%
- **Infrastructure Layer**: > 70% (harder to test, covered by integration tests)
- **Presentation Layer**: > 80%

## Best Practices

### ✅ DO

- Write tests for all business logic
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests independent (no shared state)
- Clean up after tests (database, mocks)
- Use factories for test data
- Test one thing per test
- Mock external dependencies in unit tests

### ❌ DON'T

- Test implementation details
- Write tests that depend on execution order
- Use real external services in tests
- Skip cleanup in `afterEach`/`afterAll`
- Write overly complex tests
- Use `any` in test expectations
- Commit failing tests

## Debugging

```bash
# Run specific test
pnpm test -t "test name"

# Increase timeout if needed
it('long test', async () => { ... }, 10000);
```


## Testing Checklist

Before marking feature as "done":

- [ ] Domain tests (entities, value objects)
- [ ] Application tests (use cases with mocked repos)
- [ ] Integration tests (HTTP endpoints)
- [ ] AAA pattern followed
- [ ] Edge cases tested
- [ ] All tests pass

## Summary

- **Unit tests**: Fast, isolated, business logic
- **Integration tests**: End-to-end, components working together
- **AAA Pattern**: Arrange-Act-Assert in every test
- **Test alongside code**: Not after!

**Remember: Tests are part of every feature, not optional!**
