# AGENTS.md - Operational Guide

- Status: Active
- Description: Detailed operational guide for AI Agents and Developers.

## Project Overview

This is a **DDD-based monorepo template** following true Domain-Driven Design principles. The architecture separates **bounded contexts** (domain logic) from **application modules** (thin interfaces).

## Architecture

### Bounded Contexts (Domain Layer)

**Location**: `shared/contexts/`

Bounded contexts are where **all domain logic** lives:

```
shared/contexts/
└── example/                      # A bounded context
    ├── domain/                   # Domain models
    │   ├── entities/             # Business entities
    │   ├── value-objects/        # Domain value objects
    │   └── repositories/         # Repository interfaces
    ├── application/              # Domain use cases
    │   ├── create-item/          # Reusable business operations
    │   └── get-items/
    ├── infrastructure/
    │   ├── database/             # Context owns its schema
    │   │   ├── prisma/
    │   │   │   └── schema.prisma # This context's schema
    │   │   └── src/              # PrismaService, DatabaseModule
    │   └── persistence/          # Repository implementations
    └── example.module.ts         # NestJS module (exports use cases)
```

**Key principles:**
- ✅ Contexts are **reusable** across any module
- ✅ Contexts are **framework-agnostic** (pure domain logic)
- ✅ Each context **owns its database schema**
- ✅ Contexts **export NestJS modules** with use cases

### Application Modules (Thin Layer)

**Location**: `modules/`

Modules are **thin application interfaces** with no domain logic:

```
modules/
├── user-app/                     # User-facing application
│   ├── frontend/                 # Next.js UI
│   ├── backend/
│   │   └── src/
│   │       ├── application/      # App-specific orchestration
│   │       │   └── register-user/ # Example: combines domain + app concerns
│   │       └── presentation/     # Controllers (delegate to contexts)
│   ├── specs/                    # OpenAPI spec
│   └── ops/                      # Docker configs
│
└── backoffice/                   # Admin panel
    └── (same structure)
```

**Key principles:**
- ✅ **No domain logic** in modules
- ✅ Controllers are **thin** - delegate to context use cases
- ✅ App-specific concerns: registration flow, notifications, UI orchestration
- ✅ Import and compose multiple contexts

### Shared Packages

**Location**: `shared/packages/`

Cross-cutting concerns (not domain-specific):

```
shared/packages/
├── auth/              # JWT utilities, role guards
└── ui/                # Shared UI components
```

## Development Commands

### Initialization (Optional)

```bash
# Initialize project with custom name (optional)
make init

# Enter your project name when prompted
# This updates network names, container prefixes, etc.
```

This step is **optional**. The template works with the default `testproject` name. See [INIT.md](./INIT.md) for details.

### Infrastructure Management

```bash
# Start shared infrastructure (Postgres, Redis, RabbitMQ, Traefik)
make start-infra

# Stop shared infrastructure
make stop-infra
```

### All Services

```bash
# Start everything (infrastructure + all modules)
make start

# View all logs
make logs

# Stop all services
make stop

# Restart all services
make restart

# Clean up (removes containers and volumes)
make clean
```

### Module-Specific Commands

#### User App Module

```bash
# Start user-app module
make start-user-app

# View logs
make logs-user-app

# Run tests
make test-user-app

# Open shell in backend
make shell-user-app-be

# Open shell in frontend
make shell-user-app-fe
```

#### Backoffice Module

```bash
# Start backoffice module
make start-backoffice

# View logs
make logs-backoffice

# Run tests
make test-backoffice

# Open shell in backend
make shell-backoffice-be

# Open shell in frontend
make shell-backoffice-fe
```

### Working Within a Module

```bash
# Navigate to module
cd modules/user-app   # or modules/backoffice

# Module commands (from within module directory)
make start         # Start this module only
make stop          # Stop this module
make logs          # View logs
make test          # Run tests
make test-be       # Run backend tests only
make test-fe       # Run frontend tests only
make lint          # Lint code
make lint-fix      # Auto-fix linting issues
make shell-be      # Open backend shell
make shell-fe      # Open frontend shell
make codegen       # Generate types from OpenAPI spec
```

### Testing

```bash
# Run all tests (all modules)
make test

# Run tests for specific module
make test-user-app
make test-backoffice

# Lint all code
make lint

# Auto-fix linting issues
make lint-fix
```

### Database Operations

**Important**: Database schemas are **context-specific**, not shared!

Each bounded context owns its Prisma schema:
- `shared/contexts/example/infrastructure/database/prisma/schema.prisma`

```bash
# Create a migration for a specific context
make db-migrate-create context=example name=add_description_field

# Apply migrations for all contexts
make db-migrate-all

# Apply migrations for specific context
make db-migrate-context context=example

# Generate Prisma clients for all contexts
make db-generate

# Open Prisma Studio for a specific context
make db-studio context=example
```

**Key points:**
- ✅ Each context has its own schema and migrations
- ✅ Contexts can use the same DB or separate databases
- ✅ Migrations are run per-context
- ✅ Never put domain models in shared database package

### API Specification & Code Generation

This project follows **Spec-Driven Development** for HTTP APIs. Each module has its own OpenAPI specification.

```bash
# Generate types for all modules
make codegen

# Generate types for specific module
cd modules/user-app && make codegen
```

**Workflow for HTTP APIs:**
1. Update module's `specs/openapi.yaml` with new endpoints/schemas
2. Run `make codegen` to generate shared TypeScript types
3. Implement backend controllers using generated types
4. Implement frontend API clients using generated types

**Workflow for CLI Commands:**
- CLI commands don't require a spec
- They reuse the same use cases as HTTP controllers
- Define in `backend/src/context/[feature]/presentation/command/`
- No code generation needed

## Code Style Guidelines

### General

- **TypeScript Strict Mode**: Always enabled
- **No `any`**: Use proper types or `unknown` with type guards
- **Functional Programming**: Prefer pure functions and immutability
- **Error Handling**: Use custom exceptions and proper error boundaries

### Backend (NestJS)

- Follow **Domain-Driven Design** principles
- Use **dependency injection** via NestJS modules
- **Repository pattern** for data access
- **Use cases** in application layer
- **Value objects** for domain logic

### Frontend (Next.js)

- Follow **Clean Architecture** principles
- **Server Components** by default, Client Components when needed
- **Custom hooks** for business logic
- **Feature-based** organization
- **Tailwind CSS** for styling

### Naming Conventions

- **Files**: `kebab-case.ts`, `PascalCase.tsx` (components)
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no I prefix)
- **Types**: `PascalCase`

## Testing Instructions

### Backend Testing

- **Unit Tests**: Test value objects, entities, domain services, use cases
- **Integration Tests**: Test HTTP endpoints, database operations
- **Location**: `backend/test/unit/` and `backend/test/integration/`
- **Pattern**: `*.spec.ts`

See module-specific `backend/TESTING.md` for detailed patterns.

### Frontend Testing

- **Component Tests**: Test UI components in isolation
- **Hook Tests**: Test custom hooks with `renderHook`
- **Integration Tests**: Test page flows with MSW
- **Location**: `frontend/__tests__/unit/` and `frontend/__tests__/integration/`
- **Pattern**: `*.spec.tsx` or `*.spec.ts`

See module-specific `frontend/TESTING.md` for detailed patterns.

## Architecture Patterns

### Bounded Context Structure

**⚠️ CRITICAL**: Domain logic lives in **bounded contexts**, NOT in modules!

```
shared/contexts/[context-name]/
├── domain/                    # Domain models (pure business logic)
│   ├── entities/              # Business entities
│   ├── value-objects/         # Domain value objects
│   ├── repositories/          # Repository interfaces (ports)
│   └── services/              # Domain services (optional)
│
├── application/               # Domain use cases (reusable)
│   ├── create-item/
│   │   ├── create-item.input.ts
│   │   ├── create-item.output.ts
│   │   └── create-item.service.ts
│   └── get-items/
│
├── infrastructure/            # Technical implementations
│   ├── database/
│   │   ├── prisma/
│   │   │   └── schema.prisma  # This context's database schema
│   │   └── src/
│   │       ├── prisma.service.ts
│   │       └── database.module.ts
│   └── persistence/
│       └── item-prisma.repository.ts  # Repository implementation
│
└── [context-name].module.ts   # NestJS module (exports use cases)
```

### Module Structure (Thin Application Layer)

**⚠️ CRITICAL**: Modules contain **NO domain logic**!

```
modules/[module-name]/
├── backend/
│   └── src/
│       ├── application/       # App-specific orchestration ONLY
│       │   └── register-user/ # Example: combines domain + app concerns
│       │       └── register-user.service.ts
│       │
│       ├── presentation/      # Controllers (thin!)
│       │   └── http/
│       │       ├── items.controller.ts  # Delegates to contexts
│       │       └── items.module.ts
│       │
│       └── app.module.ts      # Imports context modules
│
├── frontend/
│   └── src/
│       ├── features/          # Clean Architecture (frontend)
│       └── app/               # Next.js App Router
│
├── specs/                     # OpenAPI spec
└── ops/                       # Docker configs
```

### Backend: True DDD Separation

**Bounded Contexts** (`shared/contexts/`):
- ✅ Domain entities and value objects
- ✅ Domain use cases (reusable business operations)
- ✅ Repository implementations
- ✅ Database schema ownership (Prisma)
- ✅ Exported as NestJS modules

**Module Backends** (`modules/*/backend/`):
- ✅ App-specific orchestration use cases
- ✅ Thin HTTP controllers
- ✅ CLI commands
- ❌ **NO** domain entities
- ❌ **NO** repositories
- ❌ **NO** database access (use contexts)
│   ├── messaging/
│   └── cache/
└── presentation/     # Entry points
    ├── http/         # Controllers
    └── command/      # CLI
```

### Frontend: Clean Architecture

```
frontend/src/features/[feature]/
├── application/      # Use cases & hooks
├── domain/          # Entities & validation
├── infrastructure/  # API clients
└── presentation/    # UI components
```

## Bounded Contexts & Packages

### Using Bounded Contexts

Contexts are located in `shared/contexts/` and exported as NestJS modules:

```typescript
// Import context module in app.module.ts
import { ExampleContextModule } from '@shared/contexts/example/example.module';

@Module({
  imports: [ExampleContextModule],  // ← Imports use cases, repos, etc.
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

### @testproject/context-[name]

Each context exports its database client as a workspace package:

```typescript
import { PrismaService } from '@testproject/context-example';
```

### @testproject/auth

JWT utilities and role guards. Located in `shared/packages/auth/`.

Usage:
```typescript
import { decodeJWT, extractUser, hasRole, UserRole } from '@testproject/auth';

const user = extractUser(token);
if (hasRole(user, UserRole.ADMIN)) {
  // Admin logic
}
```

### @testproject/ui (Optional)

Shared UI components. Located in `shared/packages/ui/`.

Usage:
```typescript
import { Button, Card } from '@testproject/ui';
```

## Database Guidelines

**⚠️ CRITICAL**: Database schema is **shared** across all contexts.

- **Schema Location**: `shared/contexts/Infrastructure/persistence/prisma/schema.prisma`
- **One schema file**: All models in one place, organized by context using comments
- **Migrations**: Run from shared location for all contexts
- **FK constraints**: Supported across contexts
- **Domain isolation**: Contexts only reference IDs, not full entities
- **No raw SQL** unless absolutely necessary
- **Migrations** for schema changes (never `db push` in production)

### Adding Models

1. Add to `shared/contexts/Infrastructure/persistence/prisma/schema.prisma`
2. Use comments to organize by context (e.g., `// ====== USER CONTEXT ======`)
3. Create migration: `make db-migrate-create name=add_your_model`
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
```

### Repository Pattern

Repositories transform Prisma plain objects to rich domain entities:

```typescript
import { PrismaService } from '@testproject/database';

class YourRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string) {
    const item = await this.prisma.yourModel.findUnique({ where: { id } });
    return this.toDomain(item);  // Transform Prisma object → Domain entity
  }
  
  private toDomain(prismaItem) {
    return new YourEntity({
      ...prismaItem,
      nullField: prismaItem.nullField ?? undefined  // null → undefined
    });
  }
}
```

## Logging

- Use structured logging (JSON format)
- Include context (userId, requestId, moduleId, etc.)
- Log levels: `debug`, `info`, `warn`, `error`
- **Never log sensitive data** (passwords, tokens, PII)

## Security Considerations

- **No secrets in code** - use environment variables
- **Validate all inputs** - use Zod schemas
- **Sanitize outputs** - prevent XSS
- **Use parameterized queries** - prevent SQL injection (Prisma handles this)
- **Authentication** - implement proper auth guards
- **Authorization** - check permissions at service level using role guards

## Pre-commit Hooks

Every commit triggers:
1. **ESLint** - Auto-fix and validate
2. **Prettier** - Format code
3. **Jest** - Run tests for changed files

If any check fails, the commit is blocked.

## Adding a New Module

1. **Copy an existing module**:
   ```bash
   cp -r modules/user-app modules/new-module
   ```

2. **Update configuration**:
   - Update `package.json` files with new names
   - Update `Makefile` with correct module name
   - Update `ops/docker-compose.yml` with unique ports and container names
   - Update service names and labels in docker-compose

3. **Add to root orchestration**:
   ```yaml
   # In ops/docker-compose.yml
   include:
     - ../modules/new-module/ops/docker-compose.yml
   ```

4. **Add Makefile targets** (optional):
   ```makefile
   # In root Makefile
   start-new-module:
       @$(MAKE) -C modules/new-module start
   ```

5. **Import contexts**:
   - Modules should import necessary bounded contexts
   - Do NOT copy domain logic - import contexts instead

## Common Tasks

### Creating a New Bounded Context

**When?** When you have new domain logic (entities, business rules).

1. **Create structure**:
   ```bash
   mkdir -p shared/contexts/notifications/{domain/{entities,value-objects,repositories},application,infrastructure/{database/prisma,persistence}}
   ```

2. **Define Prisma schema**:
   - Create `infrastructure/database/prisma/schema.prisma`
   - Define domain models for this context

3. **Implement domain layer**:
   - Create entities in `domain/entities/`
   - Create value objects in `domain/value-objects/`
   - Define repository interfaces in `domain/repositories/`

4. **Implement use cases**:
   - Create use case services in `application/`
   - These should be reusable by any module

5. **Implement infrastructure**:
   - Create repository implementations in `infrastructure/persistence/`
   - Setup Prisma client in `infrastructure/database/src/`

6. **Create context module**:
   - Create `[context-name].module.ts`
   - Export use cases for modules to import

7. **Add to workspace**:
   - Context database packages are auto-discovered via `pnpm-workspace.yaml`

**See**: `shared/contexts/CREATING_CONTEXTS.md` for detailed guide.

### Adding a New HTTP API Endpoint (Module)

**⚠️ Remember**: Controllers are thin! Delegate to context use cases.

1. **Update OpenAPI Spec**: Edit `modules/[module]/specs/openapi.yaml`
   - Add path under `paths:`
   - Define request/response schemas under `components/schemas:`

2. **Generate Types**: Run `make codegen`

3. **Implement thin controller**:
   ```typescript
   // modules/user-app/backend/src/presentation/http/items.controller.ts
   @Controller('items')
   export class ItemsController {
     constructor(
       private createItem: CreateItemService,  // ← From context
     ) {}
     
     @Post()
     async create(@Body() dto: CreateItemDto) {
       return this.createItem.execute(dto);  // ← Delegate to context
     }
   }
   ```

4. **Add app-specific orchestration** (if needed):
   ```typescript
   // modules/user-app/backend/src/application/register-item.service.ts
   @Injectable()
   export class RegisterItemService {
     constructor(
       private createItem: CreateItemService,      // ← Domain
       private sendNotification: NotificationService  // ← App-specific
     ) {}
     
     async execute(input) {
       const item = await this.createItem.execute(input);
       await this.sendNotification.notify(item);
       return item;
     }
   }
   ```

5. **Test**: Add integration tests

### Adding Domain Logic (Backend)

**⚠️ STOP!** Domain logic goes in **bounded contexts**, not modules!

1. **Identify the bounded context**:
   - Is this new domain logic? → Create new context
   - Extends existing domain? → Add to existing context

2. **Implement in context**:
   - Add entities/value objects in `shared/contexts/[name]/domain/`
   - Add use case in `shared/contexts/[name]/application/`
   - Add repository in `shared/contexts/[name]/infrastructure/persistence/`
   - Update Prisma schema in context

3. **Export from context module**:
   - Add use case to context's NestJS module exports

4. **Use in module**:
   - Import context module in app.module.ts
   - Inject use case in controller or app-specific service

### Adding App-Specific Logic (Backend)

**When?** Registration flow, notifications, analytics, UI-specific orchestration.

1. **Create in module's application layer**:
   ```typescript
   // modules/user-app/backend/src/application/register-user/
   ```

2. **Compose domain use cases**:
   - Inject context use cases
   - Add app-specific side effects (emails, analytics)
   - NO domain logic here!

3. **Use in controller**:
   - Inject your app-specific service
   - Keep controller thin

### Adding a New Feature (Frontend)

1. Create new feature: `frontend/src/features/[feature]/`
2. Create domain types and validation
3. Create API client in infrastructure layer
4. Create use case hook in application layer
5. Create UI components in presentation layer
6. Add component tests
7. Update module `ARCHITECTURE.md` if needed

## Troubleshooting

### Services won't start
```bash
make clean  # Remove all containers and volumes
make start  # Fresh start
```

### Database issues
```bash
make db-migrate-all  # Apply all context migrations
make db-generate     # Regenerate Prisma clients
```

### Port conflicts
Check `ops/docker/docker-compose.yml` and module `ops/docker-compose.yml` files for port mappings and adjust if needed.

### Module-specific issues
```bash
# Stop problematic module
cd modules/[module] && make stop

# Restart it
make start

# View logs
make logs
```

## Environment Variables

- Backend: Create `backend/.env` from `backend/.env.example` (if exists)
- Frontend: Create `frontend/.env.local` from `frontend/.env.example` (if exists)
- Never commit `.env` files

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
