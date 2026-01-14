# Backend Architecture

This document describes the architectural design of the backend application, including Domain-Driven Design (DDD) principles, directory structure, and component interactions.

## Table of Contents

- [Overview](#overview)
- [Domain-Driven Design](#domain-driven-design)
- [Directory Structure](#directory-structure)
- [Layers and Dependencies](#layers-and-dependencies)
- [Component Interactions](#component-interactions)
- [Database Schema](#database-schema)
- [Best Practices](#best-practices)

## Overview

The backend follows **Domain-Driven Design** with clear separation of concerns across four main layers:

- **Domain Layer**: Pure business logic (entities, value objects, domain services, repository interfaces)
- **Application Layer**: Use cases that orchestrate domain logic
- **Infrastructure Layer**: External concerns (database, cache, messaging implementations)
- **Presentation Layer**: Entry points (HTTP controllers, CLI commands)

### Key Characteristics

- **Pattern**: Domain-Driven Design with Hexagonal Architecture
- **Framework**: NestJS with Prisma ORM
- **Database**: PostgreSQL
- **Validation**: Zod schemas for domain, class-validator for DTOs
- **Testing**: Unit tests for domain/application, integration tests for endpoints

## Domain-Driven Design

### Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   HTTP Controllers        │    CLI Commands                │ │
│  │   - Request handling      │    - Command handling          │ │
│  │   - DTO validation        │    - Output formatting         │ │
│  │   - Response mapping      │                                │ │
│  └────────────────────┬─────────────────────────────────────── │ │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│                  APPLICATION LAYER                              │
│  ┌────────────────────▼────────────────────────────────────┐   │
│  │   Use Cases (Services)                                  │   │
│  │   - Business flow orchestration                         │   │
│  │   - Input validation (Zod)                              │   │
│  │   - Call domain services & repositories                 │   │
│  │   - Return structured outputs                           │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│                    DOMAIN LAYER                                 │
│  ┌────────────────────▼────────────────────────────────────┐   │
│  │   Entities & Value Objects                              │   │
│  │   - Pure business logic                                 │   │
│  │   - Invariant enforcement                               │   │
│  │   - No framework dependencies                           │   │
│  │                                                          │   │
│  │   Repository Interfaces (Ports)                         │   │
│  │   - Define data access contracts                        │   │
│  │                                                          │   │
│  │   Domain Services                                       │   │
│  │   - Complex business rules spanning multiple entities   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│               INFRASTRUCTURE LAYER                              │
│  ┌────────────────────▼────────────────────────────────────┐   │
│  │   Repositories (Prisma)                                 │   │
│  │   - Implement repository interfaces                     │   │
│  │   - Map between domain entities and DB models           │   │
│  │                                                          │   │
│  │   Cache Adapters (Redis)                                │   │
│  │   Messaging Adapters (RabbitMQ)                         │   │
│  │   External API Clients                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rules

**Critical Rule**: Dependencies only point inward. Inner layers never depend on outer layers.

- ✅ Presentation → Application → Domain
- ✅ Infrastructure → Domain (implements interfaces)
- ❌ Domain → Infrastructure (NEVER)
- ❌ Application → Presentation (NEVER)

## Directory Structure

```
backend/
├── src/
│   ├── context/                      # Bounded contexts
│   │   └── example/                  # Example context
│   │       ├── application/          # Application layer
│   │       │   ├── create-item/
│   │       │   │   ├── create-item.input.ts
│   │       │   │   ├── create-item.output.ts
│   │       │   │   └── create-item.service.ts
│   │       │   └── get-items/
│   │       │       └── get-items.service.ts
│   │       ├── domain/               # Domain layer
│   │       │   ├── entities/
│   │       │   │   └── item.entity.ts
│   │       │   ├── value-objects/
│   │       │   │   └── item-name.value-object.ts
│   │       │   ├── repositories/
│   │       │   │   └── item.repository.interface.ts
│   │       │   └── services/
│   │       ├── infrastructure/       # Infrastructure layer
│   │       │   ├── persistence/
│   │       │   │   └── item-prisma.repository.ts
│   │       │   ├── cache/
│   │       │   └── messaging/
│   │       ├── presentation/         # Presentation layer
│   │       │   ├── http/
│   │       │   │   ├── dto/
│   │       │   │   │   ├── create-item.dto.ts
│   │       │   │   │   └── item-response.dto.ts
│   │       │   │   └── items.controller.ts
│   │       │   └── command/
│   │       └── example.module.ts
│   ├── shared/                       # Shared utilities
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── logging/
│   │   └── config/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── test/
    ├── unit/
    └── integration/
```

## Layers and Dependencies

### Domain Layer

**Purpose**: Contains pure business logic, framework-agnostic.

**Components**:
- **Entities**: Objects with identity and lifecycle
  - Example: `ItemEntity`
  - Contains business rules and invariants
  - Uses Zod for validation

- **Value Objects**: Immutable objects without identity
  - Example: `ItemName`
  - Encapsulates validation logic
  - Provides domain-specific behavior

- **Repository Interfaces**: Define data access contracts
  - Example: `ItemRepositoryInterface`
  - Domain defines what it needs, not how it's implemented

- **Domain Services**: Complex business logic spanning multiple entities
  - Use when logic doesn't naturally fit in a single entity

**Rules**:
- No dependencies on outer layers
- No framework-specific code (NestJS, Prisma, etc.)
- Validated with Zod schemas
- Testable without mocks

### Application Layer

**Purpose**: Orchestrates business flows (use cases).

**Components**:
- **Use Case Services**: Single-responsibility services
  - Example: `CreateItemService`, `GetItemsService`
  - Input: Input DTOs (validated with Zod)
  - Output: Output DTOs
  - Orchestrates domain entities and repositories

**Rules**:
- Can depend on Domain layer only
- No HTTP/CLI concerns (that's Presentation)
- No database implementation details (use repository interfaces)
- Each use case is a single class with `execute()` method

**Example Pattern**:
```typescript
@Injectable()
export class CreateItemService {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: ItemRepositoryInterface
  ) {}

  async execute(input: CreateItemInput): Promise<CreateItemOutput> {
    // 1. Validate input
    const validated = CreateItemInputSchema.parse(input);
    
    // 2. Create domain entity
    const item = new ItemEntity({ ... });
    
    // 3. Persist via repository
    const created = await this.itemRepository.create(item);
    
    // 4. Return output
    return new CreateItemOutput(...);
  }
}
```

### Infrastructure Layer

**Purpose**: Implements external concerns.

**Components**:
- **Repositories**: Prisma implementations
  - Example: `ItemPrismaRepository implements ItemRepositoryInterface`
  - Maps between domain entities and DB models

- **Cache Adapters**: Redis implementations
- **Messaging Adapters**: RabbitMQ publishers/subscribers
- **External Clients**: HTTP clients for external APIs

**Rules**:
- Implements interfaces defined in Domain
- Can depend on Domain layer
- Contains all framework-specific code (Prisma, Redis, etc.)

### Presentation Layer

**Purpose**: Entry points for the application.

**Components**:
- **HTTP Controllers**: REST API endpoints
  - Example: `ItemsController`
  - Handles HTTP concerns (status codes, headers)
  - Validates request DTOs with class-validator
  - Maps outputs to response DTOs

- **CLI Commands**: Command-line interfaces
  - For admin tasks, migrations, etc.

**Rules**:
- Depends on Application layer (calls use case services)
- No business logic (delegate to use cases)
- Responsible for HTTP/CLI concerns only

## Component Interactions

### Request Flow Example: Create Item

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐
│ Client  │────▶│ItemsController│────▶│CreateItem   │────▶│ItemPrisma  │
│         │     │ (HTTP)       │     │Service      │     │Repository  │
└─────────┘     └──────────────┘     └─────────────┘     └────────────┘
     │                │                     │                    │
     │  POST /items   │                     │                    │
     │  { dto }       │                     │                    │
     │───────────────▶│                     │                    │
     │                │  execute(input)     │                    │
     │                │────────────────────▶│                    │
     │                │                     │  create(entity)    │
     │                │                     │───────────────────▶│
     │                │                     │                    │
     │                │                     │◀───────────────────│
     │                │                     │    entity          │
     │                │◀────────────────────│                    │
     │                │    output           │                    │
     │◀───────────────│                     │                    │
     │  201 Created   │                     │                    │
     │  { response }  │                     │                    │
```

### Layer Responsibilities

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Controller** | HTTP handling, validation, DTO mapping | Parse request, validate DTO, return 201 |
| **Use Case** | Business flow orchestration | Create entity, call repository, return output |
| **Repository** | Data persistence | Map entity to Prisma, save, map back |
| **Entity** | Domain rules and invariants | Validate name length, enforce business rules |

## Database Schema

### Prisma Schema

Located at: `prisma/schema.prisma`

```prisma
model Item {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("items")
}
```

### Migrations

- **Create Migration**: `make db-migrate-create name=<name>` (from project root)
- **Apply Migration**: `make db-migrate` (from project root)
- **Seed Data**: `make db-seed` (from project root)

All commands run inside Docker containers.

## Best Practices

### 1. Keep Domain Pure

❌ **Bad** - Domain depending on infrastructure:
```typescript
// DON'T: Import Prisma in domain
import { PrismaClient } from '@prisma/client';

export class ItemEntity {
  save(prisma: PrismaClient) { ... }  // ❌ Violates DDD
}
```

✅ **Good** - Domain stays pure:
```typescript
// DO: Domain defines interface
export interface ItemRepositoryInterface {
  create(item: ItemEntity): Promise<ItemEntity>;
}

// Infrastructure implements it
export class ItemPrismaRepository implements ItemRepositoryInterface {
  create(item: ItemEntity): Promise<ItemEntity> { ... }
}
```

### 2. Use Value Objects for Domain Concepts

❌ **Bad**:
```typescript
if (name.length < 3) throw new Error('Name too short');
```

✅ **Good**:
```typescript
const itemName = ItemName.create(name);  // Validation in value object
```

### 3. Single Responsibility for Use Cases

One use case = one business flow

✅ **Good**:
- `CreateItemService`
- `UpdateItemService`
- `GetItemsService`

❌ **Bad**:
- `ItemService` with 10 methods

### 4. Dependency Injection

Use symbols for injection tokens:

```typescript
export const ITEM_REPOSITORY = Symbol('ITEM_REPOSITORY');

// In module:
{
  provide: ITEM_REPOSITORY,
  useClass: ItemPrismaRepository,
}
```

### 5. Testability

- **Domain**: Test without any mocks (pure functions)
- **Application**: Mock repositories only
- **Infrastructure**: Integration tests with real database
- **Presentation**: Integration tests with real HTTP

## Adding New Features

### 1. Create New Context (if needed)

```bash
mkdir -p src/context/[feature]/{application,domain,infrastructure,presentation}
```

### 2. Domain First

1. Create entities and value objects
2. Define repository interfaces
3. Write unit tests

### 3. Application Layer

1. Create use case inputs/outputs
2. Implement use case service
3. Write unit tests

### 4. Infrastructure Layer

1. Implement repository with Prisma
2. Write integration tests

### 5. Presentation Layer

1. Create DTOs
2. Create controller
3. Write integration tests

## Summary

This architecture ensures:
- **Testability**: Separated layers enable thorough testing
- **Maintainability**: Clear responsibilities make changes easier
- **Flexibility**: Infrastructure can be swapped without affecting business logic
- **Scalability**: Bounded contexts allow team scaling

Always respect the dependency rules and keep business logic in the domain layer!
