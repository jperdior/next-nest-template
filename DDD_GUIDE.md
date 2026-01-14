# Domain-Driven Design Guide

**Status**: Active  
**Audience**: Developers and AI Agents

## Overview

This project follows **true Domain-Driven Design (DDD)** principles with a clear separation between:
- **Bounded Contexts** (`shared/contexts/`) - Domain logic
- **Application Modules** (`modules/`) - Thin application interfaces

This guide explains how to work within this architecture.

---

## Core Concepts

### Bounded Context

A **bounded context** is a logical boundary around a specific domain or subdomain. It encapsulates:
- Domain models (entities, value objects)
- Domain use cases (business operations)
- Repository implementations
- Database schema

**Example**: `users`, `orders`, `notifications`, `inventory`

### Application Module

An **application module** is a thin layer that provides user-facing interfaces:
- HTTP APIs (via controllers)
- Command-line tools
- App-specific orchestration

Modules **import and compose** bounded contexts but contain **no domain logic**.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 Application Modules                      │
│             (Thin HTTP/CLI/UI Layers)                    │
│                                                          │
│  ┌─────────────┐         ┌──────────────┐              │
│  │  user-app   │         │  backoffice  │              │
│  │             │         │              │              │
│  │ • HTTP API  │         │ • Admin API  │              │
│  │ • Frontend  │         │ • Admin UI   │              │
│  │ • App Logic │         │ • App Logic  │              │
│  └──────┬──────┘         └──────┬───────┘              │
│         │                       │                       │
│         └───────┬───────────────┘                       │
│                 │  (imports)                            │
└─────────────────┼─────────────────────────────────────┘
                  │
     ┌────────────▼────────────┐
     │   Bounded Contexts      │
     │  (Domain Layer)         │
     │                         │
     │  ┌─────────────────┐   │
     │  │   Users         │   │
     │  │ • Entities      │   │
     │  │ • Use Cases     │   │
     │  │ • Repositories  │   │
     │  │ • DB Schema     │   │
     │  └─────────────────┘   │
     │                         │
     │  ┌─────────────────┐   │
     │  │   Orders        │   │
     │  │ • Entities      │   │
     │  │ • Use Cases     │   │
     │  │ • Repositories  │   │
     │  │ • DB Schema     │   │
     │  └─────────────────┘   │
     └─────────────────────────┘
```

---

## Directory Structure

### Bounded Context Structure

```
shared/contexts/[context-name]/
├── domain/                        # Domain models (pure business logic)
│   ├── entities/                  # Business entities with behavior
│   │   └── user.entity.ts
│   ├── value-objects/             # Immutable value objects
│   │   └── email.value-object.ts
│   ├── repositories/              # Repository interfaces (ports)
│   │   └── user.repository.interface.ts
│   └── services/                  # Domain services (optional)
│       └── user-validator.service.ts
│
├── application/                   # Domain use cases (reusable)
│   ├── create-user/
│   │   ├── create-user.input.ts   # Input DTO
│   │   ├── create-user.output.ts  # Output DTO
│   │   └── create-user.service.ts # Use case implementation
│   └── get-user/
│       └── get-user.service.ts
│
├── infrastructure/                # Technical implementations
│   ├── database/                  # Prisma setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # This context's schema
│   │   │   └── migrations/        # Migration history
│   │   ├── src/
│   │   │   ├── prisma.service.ts  # Prisma service
│   │   │   ├── database.module.ts # NestJS module
│   │   │   └── index.ts           # Exports
│   │   ├── package.json           # @testproject/context-[name]
│   │   └── tsconfig.json
│   │
│   └── persistence/               # Repository implementations
│       └── user-prisma.repository.ts
│
└── [context-name].module.ts       # NestJS module (exports use cases)
```

### Module Structure (Thin Layer)

```
modules/[module-name]/
├── backend/
│   └── src/
│       ├── application/           # App-specific orchestration
│       │   └── register-user/     # Example: user registration flow
│       │       └── register-user.service.ts
│       │
│       ├── presentation/          # Controllers (thin!)
│       │   └── http/
│       │       ├── users.controller.ts
│       │       ├── users.module.ts
│       │       └── dto/
│       │
│       └── app.module.ts          # Imports context modules
│
└── frontend/
    └── src/
        ├── features/              # Clean Architecture features
        └── app/                   # Next.js App Router
```

---

## When to Create a Bounded Context

Create a **bounded context** when you have:

✅ **New domain concepts** with entities and business rules  
✅ **Reusable business operations** that multiple modules might use  
✅ **Independent domain model** that doesn't fit existing contexts  
✅ **Database schema** for a specific subdomain  

**Examples**:
- `users` - User entities, authentication, profiles
- `orders` - Order processing, order lifecycle
- `inventory` - Stock management, product catalog
- `notifications` - Notification templates, delivery

❌ **Don't create a context for**:
- UI-specific logic (put in module frontend)
- HTTP request/response formatting (put in module controllers)
- App-specific workflows without reusable domain logic

---

## When to Add Code to a Module

Add code to a **module** when you have:

✅ **HTTP controllers** that expose APIs  
✅ **CLI commands** for administrative tasks  
✅ **App-specific orchestration** (e.g., registration flow with email)  
✅ **Frontend UI** and user-facing pages  

**Examples**:
- `modules/user-app/backend/presentation/http/auth.controller.ts` - Login endpoint
- `modules/user-app/backend/application/register-user.service.ts` - Registration flow (domain + email)
- `modules/backoffice/frontend/features/users/UserList.tsx` - Admin UI

❌ **Don't put in modules**:
- Domain entities or value objects
- Repository implementations
- Database schemas
- Reusable business logic

---

## How to Work with Bounded Contexts

### Creating a New Context

See `shared/contexts/CREATING_CONTEXTS.md` for step-by-step instructions.

**Quick overview**:
1. Create directory structure
2. Define Prisma schema
3. Implement domain layer (entities, value objects)
4. Implement use cases (application layer)
5. Implement repositories (infrastructure layer)
6. Create context NestJS module
7. Export use cases

### Using a Context in a Module

**Step 1**: Import the context module

```typescript
// modules/user-app/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ExampleContextModule } from '@shared/contexts/example/example.module';

@Module({
  imports: [
    ExampleContextModule,  // ← Import bounded context
  ],
})
export class AppModule {}
```

**Step 2**: Inject use cases in controllers

```typescript
// modules/user-app/backend/src/presentation/http/items.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateItemService } from '@shared/contexts/example/application/create-item/create-item.service';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly createItem: CreateItemService,  // ← Inject use case
  ) {}

  @Post()
  async create(@Body() dto: CreateItemDto) {
    // Thin controller - just delegate to context
    return this.createItem.execute(dto);
  }
}
```

### App-Specific Orchestration

When you need to combine domain logic with app-specific concerns:

```typescript
// modules/user-app/backend/src/application/register-item/register-item.service.ts
import { Injectable } from '@nestjs/common';
import { CreateItemService } from '@shared/contexts/example/application/create-item/create-item.service';
import { NotificationService } from '../notifications/notification.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class RegisterItemService {
  constructor(
    private createItem: CreateItemService,         // ← Domain use case
    private notifications: NotificationService,     // ← App-specific
    private analytics: AnalyticsService,            // ← App-specific
  ) {}

  async execute(input: RegisterItemInput) {
    // 1. Validate app-specific rules
    await this.validateUserQuota(input.userId);

    // 2. Execute domain logic
    const item = await this.createItem.execute({
      name: input.name,
      description: input.description,
    });

    // 3. App-specific side effects
    await Promise.all([
      this.notifications.sendItemCreated(input.userId, item),
      this.analytics.trackItemCreated(input.userId, item.id),
    ]);

    return item;
  }

  private async validateUserQuota(userId: string) {
    // App-specific business rule
    // (not reusable domain logic)
  }
}
```

---

## Database Management

### Schema Ownership

Each bounded context **owns its Prisma schema**:

```
shared/contexts/example/infrastructure/database/prisma/schema.prisma
```

**Example schema**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../generated"
}

model Item {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("items")
}
```

### Creating Migrations

```bash
# Create migration for a specific context
make db-migrate-create context=example name=add_status_field

# Apply all migrations
make db-migrate-all

# Apply migration for specific context
make db-migrate-context context=example
```

### Prisma Client Generation

```bash
# Generate Prisma clients for all contexts
make db-generate
```

The generated client is available at:
```
shared/contexts/example/infrastructure/database/generated/
```

---

## Best Practices

### ✅ DO

- **Put domain logic in contexts**, not modules
- **Keep controllers thin** - just HTTP concerns
- **Reuse context use cases** across multiple modules
- **Use dependency injection** for all dependencies
- **Write tests at the right layer** - domain tests in contexts, integration tests in modules
- **Use value objects** for domain concepts (Email, Money, Status)
- **Keep contexts independent** - avoid tight coupling between contexts

### ❌ DON'T

- **Don't put entities in modules**
- **Don't duplicate domain logic** from contexts into modules
- **Don't access Prisma directly in modules** - use context use cases
- **Don't create circular dependencies** between contexts
- **Don't put app-specific logic in contexts** - keep them reusable
- **Don't create "God contexts"** - keep contexts focused on a single subdomain

---

## Common Patterns

### Pattern 1: Simple CRUD

**Context provides**: CRUD use cases  
**Module uses**: Directly in thin controllers

```typescript
@Controller('items')
export class ItemsController {
  constructor(
    private create: CreateItemService,
    private getAll: GetItemsService,
    private getById: GetItemByIdService,
    private update: UpdateItemService,
    private delete: DeleteItemService,
  ) {}

  @Post()
  create(@Body() dto) {
    return this.create.execute(dto);
  }

  @Get()
  getAll() {
    return this.getAll.execute();
  }
}
```

### Pattern 2: Complex Orchestration

**Context provides**: Domain operations  
**Module adds**: App-specific orchestration

```typescript
// Module's app-specific service
@Injectable()
export class CheckoutService {
  constructor(
    private createOrder: CreateOrderService,     // From orders context
    private chargePayment: ChargePaymentService, // From payments context
    private sendEmail: SendEmailService,         // App-specific
  ) {}

  async execute(input: CheckoutInput) {
    // 1. Domain: Create order
    const order = await this.createOrder.execute(input.orderData);

    // 2. Domain: Charge payment
    const payment = await this.chargePayment.execute({
      orderId: order.id,
      amount: order.total,
    });

    // 3. App-specific: Send confirmation
    await this.sendEmail.sendOrderConfirmation(order, payment);

    return { order, payment };
  }
}
```

### Pattern 3: Cross-Context Integration

When contexts need to interact, use **application services** in modules:

```typescript
// In module's application layer
@Injectable()
export class OrderFulfillmentService {
  constructor(
    private getOrder: GetOrderService,           // From orders context
    private reserveInventory: ReserveInventoryService, // From inventory context
    private createShipment: CreateShipmentService,     // From shipping context
  ) {}

  async execute(orderId: string) {
    const order = await this.getOrder.execute(orderId);
    await this.reserveInventory.execute(order.items);
    const shipment = await this.createShipment.execute(order);
    return shipment;
  }
}
```

**⚠️ Important**: Contexts should NOT directly call each other's repositories!

---

## Testing Strategy

### Context Testing

**Unit tests** for domain logic:
```typescript
// shared/contexts/example/domain/entities/item.entity.spec.ts
describe('ItemEntity', () => {
  it('should create valid item', () => {
    const item = new ItemEntity({
      id: 'test-id',
      name: 'Test Item',
      description: 'Description',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(item.name).toBe('Test Item');
  });
});
```

**Integration tests** for use cases:
```typescript
// shared/contexts/example/application/create-item/create-item.service.spec.ts
describe('CreateItemService', () => {
  let service: CreateItemService;
  let repository: MockItemRepository;

  beforeEach(() => {
    repository = new MockItemRepository();
    service = new CreateItemService(repository);
  });

  it('should create item', async () => {
    const result = await service.execute({
      name: 'New Item',
      description: 'Test',
    });
    expect(result.name).toBe('New Item');
  });
});
```

### Module Testing

**Integration tests** for endpoints:
```typescript
// modules/user-app/backend/test/integration/items.spec.ts
describe('POST /items', () => {
  it('should create item', async () => {
    const response = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Test', description: 'Desc' })
      .expect(201);

    expect(response.body.name).toBe('Test');
  });
});
```

---

## Migration Guide

### Moving from Old Structure to DDD

If you have existing code in `modules/*/backend/src/context/`:

1. **Identify bounded contexts** in your domain
2. **Move domain logic** to `shared/contexts/[name]/`
3. **Update imports** in modules to use contexts
4. **Convert thick controllers** to thin ones
5. **Extract app-specific logic** into module's application layer
6. **Update tests** to match new structure

See implementation details in the plan that was executed.

---

## Resources

- **Creating Contexts**: `shared/contexts/CREATING_CONTEXTS.md`
- **Architecture Invariants**: `INVARIANTS.md`
- **Operational Guide**: `AGENTS.md`
- **Module Architecture**: `modules/*/backend/ARCHITECTURE.md`

---

## Summary

**Remember**:
- **Bounded contexts** = Domain logic (reusable)
- **Modules** = Application interfaces (thin)
- **Controllers** delegate to contexts
- **App-specific logic** goes in module's application layer
- **Domain logic** stays in contexts

When in doubt, ask: "Is this logic reusable by other modules?" If yes → context. If no → module.
