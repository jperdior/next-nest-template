# Backend - Agent Guidelines

**⚠️ CRITICAL**: Before implementing ANY feature, you MUST read [TESTING.md](./TESTING.md). Tests are developed alongside features, not after.

---

## Overview

This backend follows Domain-Driven Design (DDD) with strict layer separation. All business logic lives in the domain layer, orchestration in the application layer, and external concerns in infrastructure.

## Development Commands

**Note:** All commands run inside Docker containers. Use `make shell-be` to open a shell in the backend container, or use the provided make commands from the project root.

```bash
# From project root

# Testing (runs in Docker)
make test-be            # Run all backend tests
make lint               # Lint backend and frontend
make lint-fix           # Auto-fix linting issues

# Database (runs in Docker)
make db-migrate-create name=add_users  # Create migration
make db-migrate         # Apply migrations
make db-studio          # Open Prisma Studio
make db-seed            # Seed database

# Development (inside container shell)
make shell-be           # Open shell in backend container
# Then inside the container:
pnpm dev                # Start in watch mode
pnpm test:watch         # Tests in watch mode
pnpm test:cov           # Coverage report
pnpm prisma:generate    # Generate Prisma client

# API Code Generation (from project root)
make codegen            # Generate shared types from OpenAPI spec
make spec-validate      # Validate OpenAPI specification
```

## Spec-Driven Development

This project follows **Spec-Driven Development** for HTTP APIs. The OpenAPI specification (`specs/openapi.yaml`) is the single source of truth.

### Workflow for New HTTP Endpoints

1. **Update OpenAPI Spec**: Edit `specs/openapi.yaml`
   - Add endpoint under `paths:`
   - Define schemas under `components/schemas:`

2. **Generate Types**: Run `make codegen` from project root
   - Generates `packages/api-types/src/generated.ts`
   - Types are shared between backend and frontend

3. **Implement Controller**: Use generated types

   ```typescript
   import type { CreateItemRequest, ItemResponse } from '@/shared/types/api-types';
   
   async create(@Body() dto: CreateItemDto): Promise<ItemResponse> {
     // Implementation uses shared types
   }
   ```


4. **Test**: Write integration tests

### CLI Commands (No Spec Required)

CLI commands reuse the same use cases as HTTP controllers:
- Define in `presentation/command/`
- Call existing use cases from `application/`
- No OpenAPI spec or code generation needed

## Code Structure Rules

### Domain Layer (`domain/`)

**What Goes Here:**
- Entities (with identity and lifecycle)
- Value Objects (immutable, validation logic)
- Repository Interfaces (ports)
- Domain Services (complex business rules)

**Rules:**
- ✅ Pure TypeScript, no framework dependencies
- ✅ Use Zod for validation
- ✅ Immutability preferred
- ❌ No Prisma, NestJS, or external libraries
- ❌ No HTTP, database, or infrastructure concerns

**Example Entity:**
```typescript
export class ItemEntity {
  private readonly id: string;
  private name: ItemName;  // Value object
  
  constructor(props: ItemEntityProps) {
    const validated = ItemEntitySchema.parse(props);
    this.id = validated.id;
    this.name = ItemName.create(validated.name);
  }
  
  // Business methods
  updateName(name: string): void {
    this.name = ItemName.create(name);
    this.updatedAt = new Date();
  }
}
```

### Application Layer (`application/`)

**What Goes Here:**
- Use Case Services (one per business flow)
- Input DTOs (with Zod validation)
- Output DTOs

**Rules:**
- ✅ One use case = one service
- ✅ Service has single `execute()` method
- ✅ Depends on Domain layer only
- ✅ Uses repository interfaces (not implementations)
- ❌ No HTTP concerns (status codes, headers)
- ❌ No direct database access

**Example Use Case:**
```typescript
@Injectable()
export class CreateItemService {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: ItemRepositoryInterface
  ) {}

  async execute(input: CreateItemInput): Promise<CreateItemOutput> {
    // Validate, create entity, persist, return output
  }
}
```

### Infrastructure Layer (`infrastructure/`)

**What Goes Here:**
- Repository implementations (Prisma)
- Cache adapters (Redis)
- Message publishers/subscribers (RabbitMQ)
- External API clients

**Rules:**
- ✅ Implements interfaces from Domain layer
- ✅ All framework-specific code
- ✅ Maps between domain entities and DB models
- ❌ No business logic

**Example Repository:**
```typescript
@Injectable()
export class ItemPrismaRepository implements ItemRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(item: ItemEntity): Promise<ItemEntity> {
    const data = item.toPlainObject();
    const created = await this.prisma.item.create({ data });
    return new ItemEntity(created);
  }
}
```

### Presentation Layer (`presentation/`)

**What Goes Here:**
- HTTP Controllers
- CLI Commands
- Request/Response DTOs (class-validator)

**Rules:**
- ✅ Handles HTTP/CLI concerns only
- ✅ Validates requests with class-validator
- ✅ Delegates to use case services
- ❌ No business logic
- ❌ No direct repository access

**Example Controller:**
```typescript
@Controller('items')
export class ItemsController {
  constructor(private readonly createItemService: CreateItemService) {}

  @Post()
  async create(@Body() dto: CreateItemDto): Promise<ItemResponseDto> {
    const result = await this.createItemService.execute(dto);
    return { /* map to response DTO */ };
  }
}
```

## Testing Guidelines

### Unit Tests

**Location**: `test/unit/context/[feature]/domain/`

**What to Test:**
- Value objects validation
- Entity business logic
- Domain services

**Pattern:**
```typescript
describe('ItemName Value Object', () => {
  it('should create valid item name', () => {
    const name = ItemName.create('Valid Name');
    expect(name.getValue()).toBe('Valid Name');
  });

  it('should reject name shorter than 3 characters', () => {
    expect(() => ItemName.create('ab')).toThrow();
  });
});
```

### Integration Tests

**Location**: `test/integration/context/[feature]/presentation/`

**What to Test:**
- HTTP endpoints
- Database operations
- Full request/response cycle

**Pattern:**
```typescript
describe('ItemsController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('POST /items should create item', async () => {
    const response = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Test Item', description: 'Test' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Item');
  });
});
```

## Module Wiring

Each context has a module file that wires dependencies:

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [ItemsController],
  providers: [
    CreateItemService,
    GetItemsService,
    {
      provide: ITEM_REPOSITORY,  // Symbol token
      useClass: ItemPrismaRepository,
    },
  ],
})
export class ExampleModule {}
```

## Adding a New Feature

**🚨 REMINDER**: Read [TESTING.md](./TESTING.md) before starting. Tests are NOT optional!

### Step 1: Domain Layer

1. Create entity: `domain/entities/[entity].entity.ts`
2. Create value objects: `domain/value-objects/`
3. Create repository interface: `domain/repositories/[entity].repository.interface.ts`
4. **Write unit tests IMMEDIATELY** ← Tests are part of the feature!

### Step 2: Application Layer

1. Create use case folder: `application/[use-case]/`
2. Create input: `[use-case].input.ts`
3. Create output: `[use-case].output.ts`
4. Create service: `[use-case].service.ts`
5. **Write unit tests IMMEDIATELY** ← Tests are part of the feature!

### Step 3: Infrastructure Layer

1. Create repository: `infrastructure/persistence/[entity]-prisma.repository.ts`
2. Update Prisma schema if needed
3. Create migration: `make db-migrate-create name=add_[entity]`
4. **Integration tests cover this** ← Tested via controllers

### Step 4: Presentation Layer

1. Create DTOs: `presentation/http/dto/`
2. Create controller: `presentation/http/[entity].controller.ts`
3. Wire in module
4. **Write integration tests IMMEDIATELY** ← Tests are part of the feature!

**Feature is DONE only when code + tests are complete and passing!**

## Database Guidelines

### Creating Migrations

```bash
# 1. Edit backend/prisma/schema.prisma
# 2. Create migration from project root
make db-migrate-create name=add_users_table
# 3. Migration auto-applies in development
```

### Seeding Data

Edit `backend/prisma/seed.ts`:

```typescript
await prisma.item.createMany({
  data: [
    { name: 'Item 1', description: 'First' },
    { name: 'Item 2', description: 'Second' },
  ],
});
```

Run from project root: `make db-seed`

## Common Patterns

### Dependency Injection with Symbols

```typescript
// In repository interface file
export const ITEM_REPOSITORY = Symbol('ITEM_REPOSITORY');

// In module
{
  provide: ITEM_REPOSITORY,
  useClass: ItemPrismaRepository,
}

// In service
constructor(
  @Inject(ITEM_REPOSITORY)
  private readonly itemRepository: ItemRepositoryInterface
) {}
```

### Validation

**Domain**: Use Zod
```typescript
const ItemEntitySchema = z.object({
  name: z.string().min(3).max(100),
});
```

**Presentation**: Use class-validator
```typescript
export class CreateItemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}
```

### Error Handling

```typescript
import { NotFoundException } from '@nestjs/common';

const item = await this.itemRepository.findById(id);
if (!item) {
  throw new NotFoundException(`Item with id ${id} not found`);
}
```

## Dos and Don'ts

### ✅ DO

- Keep business logic in domain layer
- Use value objects for domain concepts
- One use case per service
- Test each layer appropriately
- Use dependency injection
- Validate inputs at layer boundaries

### ❌ DON'T

- Put business logic in controllers
- Use Prisma in domain layer
- Mix HTTP concerns with business logic
- Skip validation
- Use `any` type
- Access database directly from controllers

## Debugging

### Prisma Queries

Enable query logging:

```typescript
// In prisma.service.ts
this.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### NestJS Debugging

```bash
# Open shell in backend container
make shell-be

# Inside container, start in debug mode
pnpm start:debug
# Then attach debugger to port 9229
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
