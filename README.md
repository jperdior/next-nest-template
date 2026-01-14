# TestProject - DDD-Based Monorepo Template

Full-stack TypeScript monorepo template with **Domain-Driven Design (DDD)** architecture, featuring bounded contexts and thin application layers.

## Overview

This template follows **true DDD architecture** with clear separation of concerns:

### Bounded Contexts (Domain Layer)
**Located in `shared/contexts/`** - These are your core business domains:
- Own domain entities, value objects, and business logic
- Contain reusable domain use cases
- Manage their own database schemas (Prisma)
- Can be consumed by any module

### Modules (Application Layer)
**Located in `modules/`** - These are your thin application interfaces:
- **Frontend** (Next.js) - User interfaces
- **Backend** (NestJS) - Thin HTTP/CLI layers
- **App-specific orchestration** - Coordinate domain use cases
- **OpenAPI Specification** - API contracts
- **Docker configuration** - Deployment setup

Modules import and orchestrate bounded contexts but contain **no domain logic**.

## Tech Stack

### Backend (per module)
- **NestJS** - TypeScript Node.js framework
- **Domain-Driven Design** - Clean architecture with bounded contexts
- **Jest** - Unit and integration testing

### Frontend (per module)
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
- **Prisma** - Type-safe ORM (per bounded context)

## Project Structure

```
testproject/
├── shared/
│   ├── contexts/              # ← Bounded Contexts (Domain Layer)
│   │   └── example/           # Example bounded context
│   │       ├── domain/        # Entities, value objects
│   │       ├── application/   # Domain use cases
│   │       ├── infrastructure/
│   │       │   ├── database/  # Prisma schema & client
│   │       │   │   ├── prisma/
│   │       │   │   │   └── schema.prisma
│   │       │   │   └── src/   # PrismaService, DatabaseModule
│   │       │   └── persistence/ # Repository implementations
│   │       └── example.module.ts # NestJS module exporting use cases
│   │
│   └── packages/              # Cross-cutting concerns
│       ├── auth/              # JWT utilities, role guards
│       └── ui/                # Shared UI components
│
├── modules/                   # ← Application Modules (Thin Layers)
│   ├── user-app/              # User-facing application
│   │   ├── frontend/          # Next.js user interface
│   │   ├── backend/
│   │   │   └── src/
│   │   │       ├── application/    # App-specific use cases
│   │   │       └── presentation/   # Controllers (thin)
│   │   ├── specs/             # OpenAPI specification
│   │   ├── ops/               # Docker configs
│   │   └── Makefile
│   │
│   └── backoffice/            # Admin panel application
│       ├── frontend/          # Next.js admin interface
│       ├── backend/           # (same structure as user-app)
│       ├── specs/             # OpenAPI specification
│       ├── ops/               # Docker configs
│       └── Makefile
│
├── infra/                     # Shared infrastructure
│   └── docker-compose.yml     # Postgres, Redis, RabbitMQ, Traefik
│
└── Makefile                   # Root commands (module orchestration, database management)
```

## Quick Start

### Prerequisites
- Docker & Docker Compose

**That's it!** All development happens inside Docker containers.

### Optional: Initialize with Custom Name

The template uses `testproject` as the default project name. You can optionally customize this:

```bash
make init
# Enter your custom project name when prompted
# This will update network names, container prefixes, etc.
```

This step is **optional**. You can use the template as-is with the default name.

### Start Development

```bash
# Start everything (infrastructure + all modules)
make start

# Or start just infrastructure
make start-infra

# Then start specific modules
make start-user-app
make start-backoffice
```

### Access Services

After running `make start`, access the applications:

| Service | URL |
|---------|-----|
| **User App Frontend** | http://localhost:3000 or http://user.local:8080 |
| **User App Backend** | http://localhost:3001 or http://api.user.local:8080 |
| **Backoffice Frontend** | http://localhost:3010 or http://admin.local:8080 |
| **Backoffice Backend** | http://localhost:3011 or http://api.admin.local:8080 |
| **Traefik Dashboard** | http://localhost:8081 |
| **RabbitMQ Management** | http://localhost:15672 (guest/guest) |
| **Prisma Studio** | http://localhost:5555 |

## Understanding the Architecture

### Bounded Contexts (Domain Layer)

**Bounded contexts** are where your core business logic lives (`shared/contexts/`):

- **Domain Models**: Entities, value objects, domain services
- **Use Cases**: Reusable business operations (e.g., `CreateItem`, `GetItems`)
- **Database Schema**: Each context owns its Prisma schema
- **Reusability**: Any module can import and use a context

**Example: `shared/contexts/example/`**
```typescript
// Import and use in any module
import { CreateItemService } from '@shared/contexts/example/application/create-item/create-item.service';
import { ExampleContextModule } from '@shared/contexts/example/example.module';

// In your module's app.module.ts
@Module({
  imports: [ExampleContextModule],
  // ...
})
```

### Modules (Application Layer)

**Modules** are thin application interfaces (`modules/`):

- **No domain logic** - just orchestration
- **App-specific concerns**: User registration, notifications, analytics
- **Thin controllers**: Delegate to context use cases
- **UI/API**: Present data to users

**Example: User-specific registration**
```typescript
// modules/user-app/backend/src/application/register-user.service.ts
@Injectable()
export class RegisterUserService {
  constructor(
    private createUser: CreateUserService,  // ← Domain use case from context
    private notifications: NotificationService  // ← App-specific
  ) {}

  async execute(input) {
    const user = await this.createUser.execute(input);  // Domain logic
    await this.notifications.sendWelcomeEmail(user);     // App logic
    return user;
  }
}
```

### Working with Modules

Each module has its own commands:

```bash
# Navigate to module
cd modules/user-app

# Start this module (requires infrastructure)
make start

# View logs
make logs

# Run tests
make test

# Shell access
make shell-be   # Backend container
make shell-fe   # Frontend container
```

### Adding a New Module

Use the AI-powered command (recommended):
```bash
# From project root
# Use Cursor's command palette: "create-module"
# The AI will guide you through the setup
```

Or manually:
1. Copy existing module structure
2. Update configuration files
3. Add to root `ops/docker-compose.yml`
4. Import necessary bounded contexts

See `CREATE_MODULE_GUIDE.md` for details.

## Root-Level Commands

### Infrastructure

| Command | Description |
|---------|-------------|
| `make start-infra` | Start shared infrastructure only |
| `make stop-infra` | Stop shared infrastructure |

### All Services

| Command | Description |
|---------|-------------|
| `make start` | Start infrastructure + all modules |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View all logs |
| `make clean` | Remove all containers and volumes |

### Module-Specific

| Command | Description |
|---------|-------------|
| `make start-user-app` | Start user-app module |
| `make start-backoffice` | Start backoffice module |
| `make logs-user-app` | View user-app logs |
| `make logs-backoffice` | View backoffice logs |
| `make shell-user-app-be` | Shell into user-app backend |
| `make shell-backoffice-fe` | Shell into backoffice frontend |

### Testing

| Command | Description |
|---------|-------------|
| `make test` | Run tests for all modules |
| `make test-user-app` | Run tests for user-app |
| `make test-backoffice` | Run tests for backoffice |
| `make lint` | Lint all code |
| `make lint-fix` | Auto-fix linting issues |

### Database (Context-Specific)

| Command | Description |
|---------|-------------|
| `make db-migrate-all` | Apply migrations for all contexts |
| `make db-migrate-context context=<name>` | Apply migrations for specific context |
| `make db-migrate-create context=<name> name=<migration>` | Create new migration for a context |
| `make db-generate` | Generate Prisma clients for all contexts |
| `make db-studio context=<name>` | Open Prisma Studio for a context |

**Examples:**
```bash
# Create migration for example context
make db-migrate-create context=example name=add_description_field

# Apply all migrations
make db-migrate-all

# Open Prisma Studio for example context
make db-studio context=example
```

### Code Generation

| Command | Description |
|---------|-------------|
| `make codegen` | Generate types from OpenAPI specs (all modules) |

Run `make help` for the complete list of commands.

## Bounded Contexts & Packages

### Bounded Contexts

**Located in `shared/contexts/`** - Each context is a complete domain:

#### Example Context (`@testproject/context-example`)

```typescript
// Import the context module in your app.module.ts
import { ExampleContextModule } from '@shared/contexts/example/example.module';

@Module({
  imports: [ExampleContextModule],
})
export class AppModule {}

// Use context use cases in controllers
import { CreateItemService } from '@shared/contexts/example/application/create-item/create-item.service';

@Controller('items')
export class ItemsController {
  constructor(private createItem: CreateItemService) {}
  
  @Post()
  async create(@Body() dto: CreateItemDto) {
    return this.createItem.execute(dto);
  }
}
```

**Creating a new context**: See `shared/contexts/CREATING_CONTEXTS.md`

### Shared Packages

#### Auth (`@testproject/auth`)

**Cross-cutting concern** for authentication and authorization.

Located in `shared/packages/auth/`, provides:
- JWT decoding and validation
- Role checking utilities (`hasRole`, `requireRole`)
- Auth types (`AuthUser`, `JWTPayload`)

Usage:
```typescript
import { decodeJWT, hasRole, UserRole } from '@testproject/auth';

const user = extractUser(token);
if (hasRole(user, UserRole.ADMIN)) {
  // Admin-only logic
}
```

#### UI (`@testproject/ui`)

Located in `shared/packages/ui/`, for shared UI components:
```typescript
import { Button, Card } from '@testproject/ui';
```

## Architecture

### True Domain-Driven Design

This template follows **authentic DDD principles**:

**Bounded Contexts** (`shared/contexts/`)
- Encapsulate complete business domains
- Own their domain models and use cases
- Manage their own database schemas
- Are **framework-agnostic** (pure domain logic)
- Can be imported by any module

**Application Modules** (`modules/`)
- Thin HTTP/UI layers
- **No domain logic** - just orchestration
- App-specific concerns (registration flow, notifications, etc.)
- Consume one or more bounded contexts
- Can be deployed independently

### Database Per Context

Each bounded context owns its Prisma schema:
- `shared/contexts/example/infrastructure/database/prisma/schema.prisma`
- Independent migrations per context
- Shared PostgreSQL instance, separate schemas possible
- Each context generates its own Prisma client

### Backend Architecture (Modules)

Module backends are **thin application layers**:
- **Application Layer**: App-specific orchestration use cases
- **Presentation Layer**: HTTP controllers, CLI commands
- **Import contexts**: Delegate to domain use cases

**No** domain, infrastructure, or repository code in modules!

See `modules/*/backend/ARCHITECTURE.md` and `DDD_GUIDE.md` for details.

### Frontend Architecture

Each frontend follows Clean Architecture:
- **Domain Layer**: Entities and validation
- **Application Layer**: Custom hooks and use cases
- **Infrastructure Layer**: API clients
- **Presentation Layer**: UI components

See `modules/*/frontend/ARCHITECTURE.md` for details.

## Database Migrations

Migrations are **context-specific** - each bounded context manages its own schema:

```bash
# Create migration for a specific context
make db-migrate-create context=example name=add_description_field

# Apply all context migrations
make db-migrate-all

# Apply migration for specific context
make db-migrate-context context=example

# Open Prisma Studio for a context
make db-studio context=example

# Generate all Prisma clients
make db-generate
```

See `shared/contexts/CREATING_CONTEXTS.md` for more on managing context databases.

## Testing

Each module has its own tests:

```bash
# Test all modules
make test

# Test specific module
cd modules/user-app && make test

# Test backend only
cd modules/user-app && make test-be

# Test frontend only
cd modules/user-app && make test-fe
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant orchestration rules
- [AGENTS.md](./AGENTS.md) - Operational guide for developers and AI
- [INVARIANTS.md](./INVARIANTS.md) - Non-negotiable architectural rules
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- Module-specific:
  - `modules/*/backend/ARCHITECTURE.md` - Backend architecture
  - `modules/*/backend/TESTING.md` - Backend testing guide
  - `modules/*/frontend/ARCHITECTURE.md` - Frontend architecture
  - `modules/*/frontend/TESTING.md` - Frontend testing guide

## Use Cases

This template is ideal for:
- **Multi-tenant applications** - Separate user and admin interfaces
- **Microservices** - Independent deployment of modules
- **Large applications** - Organized by business domain
- **Team scaling** - Teams can own specific modules

## License

MIT
