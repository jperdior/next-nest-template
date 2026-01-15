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

- **Test behavior, not implementation** - Tests should verify what the code does, not how it does it
- **Fast feedback** - Unit tests run in milliseconds, integration tests in seconds
- **Confidence** - Tests should catch bugs before they reach production
- **Maintainability** - Tests should be easy to understand and update
- **AAA Pattern** - All tests follow Arrange-Act-Assert structure (see [AAA_TESTING_PATTERN.md](./AAA_TESTING_PATTERN.md))

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

## Test Database

All integration tests use a separate test database: `testproject_test`

### Configuration

- **Development DB**: `testproject` (port 5432)
- **Test DB**: `testproject_test` (same PostgreSQL instance, port 5432)

### Setup

The test database is automatically:
1. Created on first connection
2. Migrated before test suite runs
3. Cleaned between tests
4. Dropped and recreated after test suite

### Usage in Tests

```typescript
import { createTestApp } from '../utils/test-app.factory';
import * as request from 'supertest';

describe('Your Feature (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should work', async () => {
    await request(app.getHttpServer())
      .post('/endpoint')
      .send({ data: 'test' })
      .expect(201);
  });
});
```

### Why Separate Database?

- **Isolation**: Tests don't affect development data
- **Speed**: Can truncate tables without worrying about real data
- **Safety**: Destructive tests won't harm development state
- **Parallelization**: Future option to run tests in parallel

## Test Structure

### Unit Test Pattern

```typescript
// test/unit/context/example/domain/value-objects/item-name.spec.ts

import { ItemName } from '@context/example/domain/value-objects/item-name.value-object';

describe('ItemName Value Object', () => {
  describe('create', () => {
    it('should create valid item name', () => {
      const name = ItemName.create('Valid Name');
      
      expect(name.getValue()).toBe('Valid Name');
    });

    it('should reject name shorter than 3 characters', () => {
      expect(() => ItemName.create('ab')).toThrow();
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => ItemName.create(longName)).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const name1 = ItemName.create('Test');
      const name2 = ItemName.create('Test');
      
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      const name1 = ItemName.create('Test1');
      const name2 = ItemName.create('Test2');
      
      expect(name1.equals(name2)).toBe(false);
    });
  });
});
```

### Integration Test Pattern

```typescript
// test/integration/context/example/presentation/http/items.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@shared/database/prisma.service';

describe('ItemsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.item.deleteMany();
  });

  describe('POST /items', () => {
    it('should create item with valid data', async () => {
      const createDto = {
        name: 'Test Item',
        description: 'Test Description',
      };

      const response = await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Test Item',
        description: 'Test Description',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should reject name shorter than 3 characters', async () => {
      const createDto = {
        name: 'ab',
        description: 'Test',
      };

      await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(400);
    });

    it('should create item without description', async () => {
      const createDto = {
        name: 'Test Item',
      };

      const response = await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(201);

      expect(response.body.description).toBeUndefined();
    });
  });

  describe('GET /items', () => {
    it('should return empty array when no items', async () => {
      const response = await request(app.getHttpServer())
        .get('/items')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all items', async () => {
      // Seed test data
      await prisma.item.createMany({
        data: [
          { name: 'Item 1', description: 'First' },
          { name: 'Item 2', description: 'Second' },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/items')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
      });
    });
  });
});
```

## Testing by Layer

### Domain Layer Tests

**Focus**: Business logic, validation, invariants.

**Example - Entity Test**:
```typescript
describe('ItemEntity', () => {
  describe('constructor', () => {
    it('should create item with valid data', () => {
      const props = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Item',
        description: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const item = new ItemEntity(props);

      expect(item.getId()).toBe(props.id);
      expect(item.getName()).toBe(props.name);
    });

    it('should reject invalid name', () => {
      const props = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'ab',  // Too short
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new ItemEntity(props)).toThrow();
    });
  });

  describe('updateName', () => {
    it('should update name and updatedAt', () => {
      const item = createTestItem();
      const originalUpdatedAt = item.getUpdatedAt();

      // Wait a bit to ensure timestamp changes
      jest.advanceTimersByTime(1000);
      
      item.updateName('New Name');

      expect(item.getName()).toBe('New Name');
      expect(item.getUpdatedAt()).not.toEqual(originalUpdatedAt);
    });
  });
});
```

### Application Layer Tests

**Focus**: Use case orchestration, input validation, output formatting.

**Example - Use Case Test**:
```typescript
describe('CreateItemService', () => {
  let service: CreateItemService;
  let mockRepository: jest.Mocked<ItemRepositoryInterface>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new CreateItemService(mockRepository);
  });

  it('should create item with valid input', async () => {
    const input = {
      name: 'Test Item',
      description: 'Test Description',
    };

    const createdEntity = new ItemEntity({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: input.name,
      description: input.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.create.mockResolvedValue(createdEntity);

    const result = await service.execute(input);

    expect(result).toBeInstanceOf(CreateItemOutput);
    expect(result.name).toBe(input.name);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid input', async () => {
    const input = {
      name: 'ab',  // Too short
    };

    await expect(service.execute(input)).rejects.toThrow();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
```

### Infrastructure Layer Tests

**Focus**: Database operations, external integrations.

**Note**: Usually tested via integration tests (testing controllers that use repositories).

If testing repositories directly:
```typescript
describe('ItemPrismaRepository', () => {
  let repository: ItemPrismaRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ItemPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<ItemPrismaRepository>(ItemPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.item.deleteMany();
  });

  it('should create item', async () => {
    const entity = new ItemEntity({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.create(entity);

    expect(result).toBeInstanceOf(ItemEntity);
    expect(result.getId()).toBe(entity.getId());
  });
});
```

### Presentation Layer Tests

**Focus**: HTTP handling, request/response mapping, validation.

See integration test pattern above.

## Test Utilities

### Test Factories

Create reusable test data:

```typescript
// test/factories/item.factory.ts

export function createTestItem(overrides?: Partial<ItemEntityProps>): ItemEntity {
  return new ItemEntity({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Item',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });
}
```

Usage:
```typescript
const item = createTestItem({ name: 'Custom Name' });
```

### Mock Repositories

```typescript
export function createMockItemRepository(): jest.Mocked<ItemRepositoryInterface> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
```

## Jest Configuration

```javascript
// jest.config.ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
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

## Debugging Tests

### Run Single Test

```bash
# Inside backend container (make shell-be)
pnpm test -t "should create item with valid data"
```

### Debug with VSCode

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Increase Timeout

```typescript
it('long running test', async () => {
  // Test code
}, 10000);  // 10 second timeout
```

## Continuous Integration

Tests run automatically on:
- Pre-commit (changed files only)
- Pull requests (all tests)
- Main branch (all tests with coverage)

## Common Issues

### Database Connection Errors

Ensure test database is running and `DATABASE_URL` is set:

```bash
# Start test database
docker compose up -d postgres

# Set test database URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/testproject_test"
```

### Test Timeouts

Increase Jest timeout or optimize slow tests:

```typescript
jest.setTimeout(10000);  // 10 seconds
```

### Flaky Tests

- Check for race conditions
- Ensure proper cleanup
- Avoid time-dependent assertions
- Use `waitFor` for async operations

## Testing Checklist for Every Feature

Before marking a feature as "done", ensure:

- [ ] **Domain Tests**: All entities and value objects have unit tests
- [ ] **Application Tests**: All use cases have unit tests (with mocked repos)
- [ ] **Integration Tests**: All HTTP endpoints have integration tests
- [ ] **AAA Pattern**: All tests follow Arrange-Act-Assert structure
- [ ] **Edge Cases**: Validation failures, error conditions tested
- [ ] **Test Utilities**: Factory functions created for reusable test data
- [ ] **Coverage**: New code has >80% coverage (domain >95%)
- [ ] **All Tests Pass**: `pnpm test` runs successfully

## Summary

- **Unit tests**: Fast, isolated, test business logic
- **Integration tests**: Slower, test components working together
- **Test each layer**: Domain, Application, Infrastructure, Presentation
- **High coverage**: Especially in Domain and Application layers
- **Clean tests**: Independent, descriptive, maintainable
- **AAA Pattern**: Follow Arrange-Act-Assert (see [AAA_TESTING_PATTERN.md](./AAA_TESTING_PATTERN.md))

---

## 🔗 Related Documentation

- **[AAA_TESTING_PATTERN.md](./AAA_TESTING_PATTERN.md)** - Detailed guide on Arrange-Act-Assert pattern
- **[BACKEND_TEST_FLOW.md](./BACKEND_TEST_FLOW.md)** - Visual flow of how tests work
- **[AGENTS.md](./AGENTS.md)** - Overall development guidelines

---

**Remember: Write tests as you code, not after. They're your safety net!**
