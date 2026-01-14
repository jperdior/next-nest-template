# Backend - Agent Guidelines

## Overview

This backend follows Domain-Driven Design (DDD) with strict layer separation. All business logic lives in the domain layer, orchestration in the application layer, and external concerns in infrastructure.

## Development Commands

```bash
# From backend directory

# Development
pnpm dev                # Start in watch mode
pnpm start              # Start normally
pnpm build              # Build for production

# Testing
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:cov           # Coverage report

# Linting
pnpm lint               # Check for issues
pnpm lint:fix           # Auto-fix issues

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate:dev # Create and apply migration
pnpm prisma:migrate     # Apply migrations (prod)
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:seed        # Seed database
```

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

### Step 1: Domain Layer

1. Create entity: `domain/entities/[entity].entity.ts`
2. Create value objects: `domain/value-objects/`
3. Create repository interface: `domain/repositories/[entity].repository.interface.ts`
4. Write unit tests

### Step 2: Application Layer

1. Create use case folder: `application/[use-case]/`
2. Create input: `[use-case].input.ts`
3. Create output: `[use-case].output.ts`
4. Create service: `[use-case].service.ts`
5. Write unit tests

### Step 3: Infrastructure Layer

1. Create repository: `infrastructure/persistence/[entity]-prisma.repository.ts`
2. Update Prisma schema if needed
3. Create migration: `pnpm prisma migrate dev --name add_[entity]`
4. Write integration tests

### Step 4: Presentation Layer

1. Create DTOs: `presentation/http/dto/`
2. Create controller: `presentation/http/[entity].controller.ts`
3. Wire in module
4. Write integration tests

## Database Guidelines

### Creating Migrations

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
pnpm prisma migrate dev --name add_users_table
# 3. Migration auto-applies in development
```

### Seeding Data

Edit `prisma/seed.ts`:

```typescript
await prisma.item.createMany({
  data: [
    { name: 'Item 1', description: 'First' },
    { name: 'Item 2', description: 'Second' },
  ],
});
```

Run: `pnpm prisma:seed`

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
pnpm start:debug
# Then attach debugger to port 9229
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
