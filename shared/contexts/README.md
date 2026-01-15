# Bounded Contexts

This directory contains the **bounded contexts** - the heart of our domain logic.

## What is a Bounded Context?

A **bounded context** is a logical boundary around a specific business domain or subdomain. It encapsulates:

- **Domain Models**: Entities, value objects, domain services
- **Use Cases**: Reusable business operations
- **Infrastructure**: Repository implementations, database schema
- **Module Export**: NestJS module that other modules can import

## Available Contexts

### `example/`

Example bounded context demonstrating the DDD patterns used in this project.

**Domain**: Item management
**Use Cases**:
- Create Item
- Get Items
- Get Item by ID
- Update Item
- Delete Item

**See**: `example/README.md` for detailed documentation.

---

## Creating a New Context

To create a new bounded context, see: **[CREATING_CONTEXTS.md](./CREATING_CONTEXTS.md)**

Quick overview:
1. Create directory structure
2. Define Prisma schema
3. Implement domain layer
4. Implement use cases
5. Implement repositories
6. Create context NestJS module
7. Use in modules

---

## Context Guidelines

### ✅ Contexts Should

- **Encapsulate a single subdomain** - focused on one business area
- **Be reusable** - any module can import and use them
- **Own their database schema** - each context manages its own Prisma schema
- **Be framework-agnostic** - domain logic shouldn't depend on NestJS
- **Export use cases** - via NestJS modules for easy consumption

### ❌ Contexts Should NOT

- **Depend on other contexts directly** - use loose coupling via events or services
- **Contain app-specific logic** - that belongs in modules
- **Access HTTP/UI concerns** - pure business logic only
- **Be overly broad** - keep them focused and cohesive

---

## Architecture Overview

```
shared/contexts/[context-name]/
├── domain/                        # Pure business logic
│   ├── entities/                  # Business entities
│   ├── value-objects/             # Domain value objects
│   ├── repositories/              # Repository interfaces (ports)
│   └── services/                  # Domain services (optional)
│
├── application/                   # Domain use cases
│   ├── create-[entity]/
│   │   ├── create-[entity].input.ts
│   │   ├── create-[entity].output.ts
│   │   └── create-[entity].service.ts
│   └── ...
│
├── infrastructure/                # Technical implementations
│   └── persistence/               # Repository implementations
│       └── [entity]-prisma.repository.ts  # Uses @testproject/database
│
└── [context-name].module.ts       # NestJS module
```

---

## Usage Example

### Importing a Context in a Module

```typescript
// modules/user-app/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ExampleContextModule } from '@shared/contexts/example/example.module';

@Module({
  imports: [
    ExampleContextModule,  // ← Import context
  ],
})
export class AppModule {}
```

### Using Context Use Cases in Controllers

```typescript
// modules/user-app/backend/src/presentation/http/items.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateItemService } from '@shared/contexts/example/application/create-item/create-item.service';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly createItem: CreateItemService,
  ) {}

  @Post()
  async create(@Body() dto: CreateItemDto) {
    return this.createItem.execute(dto);
  }
}
```

---

## Database Organization

All database models are in: `shared/contexts/Infrastructure/persistence/prisma/schema.prisma`

- **Single schema** for all contexts
- **Organized** using comment separators
- **Cross-context FK relationships** supported
- **Each context's repository** uses `@testproject/database` package

### Adding Models for New Contexts

1. Add models to `shared/contexts/Infrastructure/persistence/prisma/schema.prisma`
2. Use comment headers to organize by context:
   ```prisma
   // ============================================================================
   // YOUR CONTEXT NAME
   // ============================================================================
   model YourModel { ... }
   ```
3. Create migration: `make db-migrate-create name=add_your_models`
4. Repository imports `@testproject/database`

### Commands

```bash
# Create migration
make db-migrate-create name=add_field

# Apply migrations (also runs on container startup)
make db-migrate-deploy

# Generate Prisma client
make db-generate

# Open Prisma Studio
make db-studio

# Open Prisma Studio for a context
make db-studio context=example
```

---

## Testing Contexts

### Unit Tests (Domain Logic)

Test entities, value objects, and domain services:

```typescript
// example/domain/entities/item.entity.spec.ts
describe('ItemEntity', () => {
  it('should enforce business rules', () => {
    // Test domain logic
  });
});
```

### Integration Tests (Use Cases)

Test use cases with mock repositories:

```typescript
// example/application/create-item/create-item.service.spec.ts
describe('CreateItemService', () => {
  it('should create item', async () => {
    // Test use case execution
  });
});
```

---

## Resources

- **Detailed Creation Guide**: [CREATING_CONTEXTS.md](./CREATING_CONTEXTS.md)
- **DDD Guide**: [../../DDD_GUIDE.md](../../DDD_GUIDE.md)
- **Architecture Invariants**: [../../INVARIANTS.md](../../INVARIANTS.md)
- **Example Context**: [example/README.md](./example/README.md)

---

## Questions?

- **When to create a context?** See `DDD_GUIDE.md` → "When to Create a Bounded Context"
- **How to structure domain models?** See example context
- **How to handle cross-context integration?** See `DDD_GUIDE.md` → "Pattern 3: Cross-Context Integration"
