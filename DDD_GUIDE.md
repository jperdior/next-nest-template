# Domain-Driven Design Guide

**Status**: Active  
**Audience**: Developers and AI Agents

## Overview

This project follows **true Domain-Driven Design (DDD)** principles inspired by the [CodelyTV PHP DDD Example](https://github.com/CodelyTV/php-ddd-example).

Key structure:
- **Bounded Contexts** (`src/`) - Domain logic organized by business context
- **Applications** (`apps/`) - Thin application interfaces
- **Shared Kernel** (`src/shared/`) - Common domain primitives

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Applications (apps/)                   │
│                  (Thin HTTP/CLI/UI Layers)                │
│                                                           │
│  ┌─────────────┐              ┌──────────────┐          │
│  │  user-app   │              │  backoffice  │          │
│  │             │              │              │          │
│  │ • HTTP API  │              │ • Admin API  │          │
│  │ • Frontend  │              │ • Admin UI   │          │
│  │ • App Logic │              │ • App Logic  │          │
│  └──────┬──────┘              └──────┬───────┘          │
│         │                            │                   │
│         └─────────┬──────────────────┘                   │
│                   │  (imports)                           │
└───────────────────┼──────────────────────────────────────┘
                    │
     ┌──────────────▼──────────────┐
     │    Bounded Contexts (src/)   │
     │                              │
     │  ┌─────────────────────┐    │
     │  │   user-facing-app/  │    │
     │  │   └── user/         │    │
     │  │       • Entities    │    │
     │  │       • Use Cases   │    │
     │  │       • Repository  │    │
     │  └─────────────────────┘    │
     │                              │
     │  ┌─────────────────────┐    │
     │  │   backoffice/       │    │
     │  │   └── user/         │    │
     │  │       • Entities    │    │
     │  │       • Use Cases   │    │
     │  │       • Repository  │    │
     │  └─────────────────────┘    │
     │                              │
     │  ┌─────────────────────┐    │
     │  │   shared/           │    │
     │  │   ├── domain/       │    │
     │  │   │   AggregateRoot │    │
     │  │   │   DomainEvent   │    │
     │  │   └── infrastructure│    │
     │  │       Prisma setup  │    │
     │  └─────────────────────┘    │
     └──────────────────────────────┘
```

---

## Directory Structure

### Bounded Context Structure

Each bounded context in `src/` follows hexagonal architecture:

```
src/[context-name]/
├── [aggregate-name]/              # One folder per aggregate
│   ├── domain/                    # Domain layer (pure business logic)
│   │   ├── entities/              # Aggregate root and entities
│   │   │   └── user.entity.ts
│   │   ├── value-objects/         # Immutable value objects
│   │   │   ├── email.value-object.ts
│   │   │   └── password.value-object.ts
│   │   ├── exceptions/            # Domain exceptions
│   │   │   └── invalid-credentials.exception.ts
│   │   └── user.repository.ts     # Repository interface (port)
│   │
│   ├── application/               # Application layer (use cases)
│   │   ├── register-user/
│   │   │   ├── register-user.input.ts
│   │   │   ├── register-user.output.ts
│   │   │   └── register-user.service.ts
│   │   └── login-user/
│   │       └── login-user.service.ts
│   │
│   ├── infrastructure/            # Infrastructure layer
│   │   └── persistence/
│   │       └── user-prisma.repository.ts
│   │
│   ├── user.module.ts             # NestJS module
│   └── index.ts                   # Exports
│
├── index.ts                       # Context exports
├── package.json                   # @testproject/[context]-context
└── tsconfig.json
```

### Shared Kernel Structure

```
src/shared/
├── domain/
│   ├── aggregate-root.ts          # Base class for aggregates
│   ├── domain-event.ts            # Base class for events
│   └── value-objects/
│       └── uuid.value-object.ts   # Shared UUIDs
│
├── infrastructure/
│   └── persistence/               # Shared Prisma setup
│       ├── prisma/
│       │   ├── schema.prisma      # Database schema
│       │   └── migrations/
│       └── src/
│           ├── prisma.service.ts
│           └── database.module.ts
│
├── index.ts
├── package.json                   # @testproject/shared
└── tsconfig.json
```

### Application Structure (Thin Layer)

```
apps/[app-name]/
├── backend/
│   └── src/
│       ├── presentation/          # Controllers (thin!)
│       │   └── http/
│       │       ├── auth.controller.ts
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

## Core Concepts

### Bounded Context

A **bounded context** is a logical boundary around a specific domain area. Each context:
- Has its own domain model (entities, value objects)
- Owns specific use cases
- Has its own view of shared concepts (e.g., User)

**Current Contexts:**
- `user-facing-app` - Auth-focused user operations (login, register)
- `backoffice` - Admin-focused user operations (list users)
- `shared` - Common domain primitives

### Aggregate Root

All aggregates extend the shared `AggregateRoot` base class:

```typescript
import { AggregateRoot } from "@testproject/shared";

export class UserFacingAppUser extends AggregateRoot {
  // Domain logic...
  
  // Record domain events
  register() {
    this.record(new UserRegisteredEvent(this.id));
  }
}
```

### Context-Specific Aggregates

Each context has its own view of shared concepts. For example, User:

**UserFacingApp User** - Auth-focused:
```typescript
class UserFacingAppUser extends AggregateRoot {
  // All auth fields
  email, passwordHash, isEmailVerified, googleId, etc.
  
  // Auth methods
  canLogin(), verifyPassword(), setPassword(), etc.
}
```

**Backoffice User** - Admin-focused:
```typescript
class BackofficeUser extends AggregateRoot {
  // Only admin-relevant fields
  id, email, name, role, isActive, createdAt
  
  // Admin methods
  activate(), deactivate()
}
```

Both map to the same database table, but each context only cares about its relevant fields.

---

## Database Strategy

### Single Prisma Schema

All contexts share one Prisma schema at `src/shared/infrastructure/persistence/prisma/schema.prisma`:

```prisma
model User {
  id                     String    @id
  email                  String    @unique
  name                   String
  passwordHash           String?
  role                   UserRole
  googleId               String?
  isEmailVerified        Boolean
  isActive               Boolean
  // ... all fields
}
```

### Context-Specific Repositories

Each context's repository maps only the fields it needs:

```typescript
// Backoffice: Maps minimal fields
class BackofficeUserPrismaRepository {
  private toDomain(prismaUser): BackofficeUser {
    return new BackofficeUser({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      isActive: prismaUser.isActive,
      // Only admin fields
    });
  }
}

// UserFacingApp: Maps all auth fields
class UserFacingAppUserPrismaRepository {
  private toDomain(prismaUser): UserFacingAppUser {
    return new UserFacingAppUser({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      isEmailVerified: prismaUser.isEmailVerified,
      // All auth fields
    });
  }
}
```

### Migration to Microservices

When ready to split:
1. Extract bounded context to its own service
2. Create its own Prisma schema with only needed fields
3. Use events for data synchronization

The domain layer doesn't change - only infrastructure.

---

## How to Use Contexts in Apps

### 1. Import the Context Module

```typescript
// apps/user-app/backend/src/app.module.ts
import { UserFacingAppUserModule } from '@testproject/user-facing-app-context';

@Module({
  imports: [
    UserFacingAppUserModule,  // ← Import bounded context
  ],
})
export class AppModule {}
```

### 2. Inject Use Cases in Controllers

```typescript
// apps/user-app/backend/src/presentation/http/auth.controller.ts
import { RegisterUserService, LoginUserService } from '@testproject/user-facing-app-context';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserService,
    private readonly loginUser: LoginUserService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUser.execute(dto); // Delegate!
  }
}
```

---

## Best Practices

### ✅ DO

- **Put domain logic in contexts**, not apps
- **Keep controllers thin** - just HTTP concerns
- **Extend AggregateRoot** for all aggregates
- **Use context-specific entities** - each context has its own view
- **Write tests at the right layer** - domain tests in contexts

### ❌ DON'T

- **Don't put entities in apps**
- **Don't share entities across contexts** - each gets its own
- **Don't access Prisma directly in apps**
- **Don't create circular dependencies between contexts**

---

## Creating a New Bounded Context

1. Create directory: `src/[context-name]/`
2. Create aggregate folder: `src/[context-name]/[aggregate]/`
3. Add domain layer (entities, value objects, repository interface)
4. Add application layer (use cases)
5. Add infrastructure layer (Prisma repository)
6. Create NestJS module exporting use cases
7. Add package.json with `@testproject/[context]-context`
8. Add to `pnpm-workspace.yaml`
9. Import in app's `app.module.ts`

---

## Resources

- **CodelyTV Example**: [github.com/CodelyTV/php-ddd-example](https://github.com/CodelyTV/php-ddd-example)
- **Operational Guide**: [AGENTS.md](./AGENTS.md)
- **Invariants**: [INVARIANTS.md](./INVARIANTS.md)
