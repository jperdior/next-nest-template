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

### Shared Prisma Schema

All database models are defined in a **single Prisma schema**:

```
shared/contexts/Infrastructure/persistence/prisma/schema.prisma
```

**Why shared?**
- Prisma cannot define relationships across separate schema files
- Cross-context FK constraints require a unified schema
- Simplifies migration management
- Maintains DDD boundaries at the domain layer

### Schema Organization

Models are organized by context using comment separators:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// EXAMPLE CONTEXT
// ============================================================================

model Item {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("items")
}

// ============================================================================
// USER CONTEXT
// ============================================================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  orders    Order[]  // Cross-context relation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// ============================================================================
// ORDER CONTEXT
// ============================================================================

model Order {
  id         String      @id @default(uuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id])  // FK constraint
  orderNumber String     @unique
  total      Decimal     @db.Decimal(10, 2)
  items      OrderItem[]
  createdAt  DateTime    @default(now())

  @@map("orders")
}

model OrderItem {
  id       String  @id @default(uuid())
  orderId  String
  order    Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  quantity Int
  price    Decimal @db.Decimal(10, 2)

  @@map("order_items")
}
```

### Prisma Returns Plain Objects

Prisma generates TypeScript types and returns **plain JavaScript objects** (not class instances):

```typescript
// Generated Prisma type
type Item = {
  id: string;
  name: string;
  description: string | null;  // Note: null, not undefined
  createdAt: Date;
  updatedAt: Date;
}

// Query returns plain object
const item = await prisma.item.findUnique({ where: { id } });
// Type: Item | null
```

### Repository Pattern

Repositories transform Prisma objects to domain entities:

```typescript
class ItemPrismaRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<ItemEntity | null> {
    // 1. Prisma returns plain object
    const item = await this.prisma.item.findUnique({
      where: { id }
    });
    
    if (!item) return null;
    
    // 2. Transform to domain
    return this.toDomain(item);
  }
  
  private toDomain(prismaItem: PrismaItem): ItemEntity {
    return new ItemEntity({
      id: prismaItem.id,
      name: prismaItem.name,
      description: prismaItem.description ?? undefined,  // null → undefined
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt
    });
  }
}
```

### Cross-Context Relationships

When contexts need to reference each other:

**Database Level**: FK constraints work

```prisma
model Order {
  userId String
  user   User @relation(fields: [userId], references: [id])
}
```

**Domain Level**: Only store IDs

```typescript
class OrderEntity {
  private userId: string;  // Reference, not full entity
  
  getUserId(): string {
    return this.userId;
  }
}
```

**Optional**: Create value objects with denormalized data

```typescript
// Snapshot of user data at order time
class OrderCustomerVO {
  constructor(
    private readonly name: string,
    private readonly email: string
  ) {}
  
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
}

// Repository can include related data
class OrderPrismaRepository {
  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true, items: true }  // Include for VO creation
    });
    
    return new OrderEntity({
      userId: order.userId,
      customer: new OrderCustomerVO(order.user.name, order.user.email),
      items: order.items.map(i => this.itemToDomain(i))
    });
  }
}
```

### Creating Migrations

```bash
# Create migration
make db-migrate-create name=add_status_field

# Apply migrations (also runs automatically on container startup)
make db-migrate-deploy

# Generate Prisma client
make db-generate

# Open Prisma Studio
make db-studio
```

### Adding Models for New Contexts

1. Add models to `shared/contexts/Infrastructure/persistence/prisma/schema.prisma`
2. Use comment headers to organize by context
3. Create migration: `make db-migrate-create name=add_your_models`
4. Repositories import `@testproject/database` package

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
