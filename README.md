# TestProject - DDD-Based Monorepo Template

Full-stack TypeScript monorepo template with **Domain-Driven Design (DDD)** architecture, inspired by [CodelyTV's PHP DDD Example](https://github.com/CodelyTV/php-ddd-example).

## Overview

This template follows **true DDD architecture** with clear separation of concerns:

### Bounded Contexts (Domain Layer)
**Located in `src/`** - These are your core business domains:
- Own domain entities, value objects, and business logic
- Contain reusable domain use cases
- Context-specific aggregates (each context has its own view of shared concepts)
- All aggregates extend the shared `AggregateRoot` base class

### Applications (Thin Layer)
**Located in `apps/`** - These are your thin application interfaces:
- **Frontend** (Next.js) - User interfaces
- **Backend** (NestJS) - Thin HTTP/CLI layers
- Import and orchestrate bounded contexts but contain **no domain logic**

## Tech Stack

### Backend (per app)
- **NestJS** - TypeScript Node.js framework
- **Domain-Driven Design** - Clean architecture with bounded contexts
- **Jest** - Unit and integration testing

### Frontend (per app)
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety across the stack
- **Tailwind CSS** - Utility-first styling
- **Clean Architecture** - Feature-based organization

### Shared Infrastructure
- **Docker & Docker Compose** - Containerized development
- **Traefik** - Reverse proxy with routing
- **PostgreSQL 16** - Shared database instance
- **Redis 7** - Shared caching layer
- **RabbitMQ 3** - Message broker
- **Prisma** - Type-safe ORM (shared schema)

## Project Structure

```
testproject/
├── src/                            # ← Bounded Contexts (Domain Layer)
│   ├── backoffice/                 # Backoffice bounded context
│   │   └── user/                   # User aggregate (admin view)
│   │       ├── domain/             # Entities, value objects
│   │       ├── application/        # Use cases (ListUsers)
│   │       └── infrastructure/     # Repository implementations
│   │
│   ├── user-facing-app/            # User-facing bounded context
│   │   └── user/                   # User aggregate (auth-focused)
│   │       ├── domain/             # Entities, value objects
│   │       ├── application/        # Use cases (Register, Login)
│   │       └── infrastructure/     # Repository implementations
│   │
│   └── shared/                     # Shared Kernel
│       ├── domain/                 # AggregateRoot, DomainEvent, ValueObjects
│       └── infrastructure/         # Shared Prisma setup
│           └── persistence/
│               └── prisma/
│                   └── schema.prisma
│
├── apps/                           # ← Applications (Thin Layers)
│   ├── user-app/                   # User-facing application
│   │   ├── frontend/               # Next.js user interface
│   │   ├── backend/                # NestJS thin controllers
│   │   ├── specs/                  # OpenAPI specification
│   │   └── ops/                    # Docker configs
│   │
│   └── backoffice/                 # Admin panel application
│       ├── frontend/               # Next.js admin interface
│       ├── backend/                # NestJS thin controllers
│       ├── specs/                  # OpenAPI specification
│       └── ops/                    # Docker configs
│
├── shared/                         # Shared packages
│   └── packages/
│       ├── auth/                   # JWT utilities, role guards
│       └── ui/                     # Shared UI components
│
└── infra/                          # Shared infrastructure
    └── docker-compose.yml          # Postgres, Redis, RabbitMQ, Traefik
```

## Quick Start

### Prerequisites
- Docker & Docker Compose

**That's it!** All development happens inside Docker containers.

### Start Development

```bash
# Start everything (infrastructure + all apps)
make start

# Or start just infrastructure
make start-infra

# Then start specific apps
make start-user-app
make start-backoffice
```

### Access Services

| Service | URL |
|---------|-----|
| **User App Frontend** | http://user.local:8080 |
| **User App Backend** | http://api.user.local:8080 |
| **Backoffice Frontend** | http://admin.local:8080 |
| **Backoffice Backend** | http://api.admin.local:8080 |
| **Traefik Dashboard** | http://localhost:8081 |
| **RabbitMQ Management** | http://localhost:15672 (guest/guest) |
| **Prisma Studio** | http://localhost:5555 |

**⚠️ Setup Required:** Add to `/etc/hosts`:
```
127.0.0.1 user.local api.user.local admin.local api.admin.local traefik.local rabbitmq.local
```

## Understanding the Architecture

### Bounded Contexts

Each bounded context in `src/` is a complete domain:
- **Domain Layer**: Entities, value objects, repository interfaces
- **Application Layer**: Use cases
- **Infrastructure Layer**: Repository implementations

**Key insight**: Each context has its own aggregates. For example, both contexts have a User entity, but with different fields:

```typescript
// src/user-facing-app/user/domain/entities/user.entity.ts
// Auth-focused: password, email verification, SSO, etc.
class UserFacingAppUser extends AggregateRoot {
  email, passwordHash, isEmailVerified, googleId, ...
}

// src/backoffice/user/domain/user.entity.ts
// Admin-focused: minimal fields for listing/management
class BackofficeUser extends AggregateRoot {
  id, email, name, role, isActive, createdAt
}
```

### Shared Kernel

The `src/shared/` contains common primitives:
- `AggregateRoot` - Base class for all aggregates
- `DomainEvent` - Base class for domain events
- Shared Prisma setup (single database schema)

### Using Contexts in Apps

```typescript
// apps/user-app/backend/src/app.module.ts
import { UserFacingAppUserModule } from '@testproject/user-facing-app-context';

@Module({
  imports: [UserFacingAppUserModule],
})
export class AppModule {}

// apps/user-app/backend/src/presentation/http/auth.controller.ts
import { RegisterUserService, LoginUserService } from '@testproject/user-facing-app-context';

@Controller('auth')
export class AuthController {
  constructor(
    private registerUser: RegisterUserService,
    private loginUser: LoginUserService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUser.execute(dto); // Delegate!
  }
}
```

## Commands

### Infrastructure

| Command | Description |
|---------|-------------|
| `make start-infra` | Start shared infrastructure |
| `make stop-infra` | Stop shared infrastructure |

### All Services

| Command | Description |
|---------|-------------|
| `make start` | Start infrastructure + all apps |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View all logs |
| `make clean` | Remove containers and volumes |

### App-Specific

| Command | Description |
|---------|-------------|
| `make start-user-app` | Start user-app |
| `make start-backoffice` | Start backoffice |
| `make logs-user-app` | View user-app logs |
| `make shell-user-app-be` | Shell into user-app backend |

### Database

| Command | Description |
|---------|-------------|
| `make db-migrate-create name=<name>` | Create migration |
| `make db-migrate-deploy` | Apply migrations |
| `make db-generate` | Generate Prisma client |
| `make db-studio` | Open Prisma Studio |

### Testing

| Command | Description |
|---------|-------------|
| `make test` | Run tests for all apps |
| `make lint` | Lint all code |

## Documentation

- [DDD_GUIDE.md](./DDD_GUIDE.md) - Full architecture reference
- [AGENTS.md](./AGENTS.md) - Operational guide
- [INVARIANTS.md](./INVARIANTS.md) - Non-negotiable architectural rules
- [CLAUDE.md](./CLAUDE.md) - AI assistant rules

## License

MIT
