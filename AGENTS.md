# AGENTS.md - Operational Guide

- Status: Active
- Description: Detailed operational guide for AI Agents and Developers.

## Project Overview

This is a **full-stack TypeScript template** using NestJS (backend) and Next.js (frontend) with Domain-Driven Design and Clean Architecture principles.

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, Redis, RabbitMQ
- **Frontend**: Next.js 14+, React, Tailwind CSS
- **Infrastructure**: Docker, Traefik, pnpm workspaces
- **Testing**: Jest, Testing Library, Supertest

## Development Commands

### Starting the Application

```bash
# Start all services (Docker)
make start

# View logs
make logs
make logs-be    # Backend only
make logs-fe    # Frontend only

# Stop services
make stop

# Restart services
make restart
```

### Testing

```bash
# Run all tests
make test

# Run backend tests
make test-be

# Run frontend tests
make test-fe

# Run tests in watch mode (local development)
cd backend && pnpm test:watch
cd frontend && pnpm test:watch
```

### Linting

```bash
# Lint all code
make lint

# Auto-fix linting issues
pnpm lint:fix
```

### Database Operations

```bash
# Create a new migration
make db-migrate-create name=add_users_table

# Apply migrations
make db-migrate

# Push schema changes (dev only, skips migrations)
make db-push

# Open Prisma Studio (database GUI)
make db-studio

# Seed the database
make db-seed
```

### Development

```bash
# Open shell in backend container
make shell-be

# Open shell in frontend container
make shell-fe
```

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

See `backend/TESTING.md` for detailed patterns.

### Frontend Testing

- **Component Tests**: Test UI components in isolation
- **Hook Tests**: Test custom hooks with `renderHook`
- **Integration Tests**: Test page flows with MSW
- **Location**: `frontend/__tests__/unit/` and `frontend/__tests__/integration/`
- **Pattern**: `*.spec.tsx` or `*.spec.ts`

See `frontend/TESTING.md` for detailed patterns.

## Architecture Patterns

### Backend: Domain-Driven Design

```
context/
└── [feature]/
    ├── application/       # Use cases (orchestration)
    ├── domain/           # Core business logic
    │   ├── entities/
    │   ├── value-objects/
    │   ├── repositories/ # Interfaces (ports)
    │   └── services/
    ├── infrastructure/   # External concerns
    │   ├── persistence/  # Repository implementations
    │   ├── messaging/
    │   └── cache/
    └── presentation/     # Entry points
        ├── http/         # Controllers
        └── command/      # CLI
```

### Frontend: Clean Architecture

```
features/
└── [feature]/
    ├── application/      # Use cases & hooks
    ├── domain/          # Entities & validation
    ├── infrastructure/  # API clients
    └── presentation/    # UI components
```

## Database Guidelines

- **Prisma** for all database operations
- **No raw SQL** unless absolutely necessary
- **Migrations** for schema changes (never `db push` in production)
- **Seeding** for development data

## Logging

- Use structured logging (JSON format)
- Include context (userId, requestId, etc.)
- Log levels: `debug`, `info`, `warn`, `error`
- **Never log sensitive data** (passwords, tokens, PII)

## Security Considerations

- **No secrets in code** - use environment variables
- **Validate all inputs** - use Zod schemas
- **Sanitize outputs** - prevent XSS
- **Use parameterized queries** - prevent SQL injection (Prisma handles this)
- **Authentication** - implement proper auth guards
- **Authorization** - check permissions at service level

## Pre-commit Hooks

Every commit triggers:
1. **ESLint** - Auto-fix and validate
2. **Prettier** - Format code
3. **Jest** - Run tests for changed files

If any check fails, the commit is blocked.

## Pull Requests

- See [CONTRIBUTING.md](./CONTRIBUTING.md) for PR workflow
- Ensure all tests pass
- Ensure linting passes
- Update documentation if architecture changes
- Describe what changed and why

## Common Tasks

### Adding a New Feature (Backend)

1. Create new context or extend existing: `backend/src/context/[feature]/`
2. Create domain entities and value objects
3. Create use case in application layer
4. Implement repository in infrastructure layer
5. Create controller in presentation layer
6. Add unit tests for domain logic
7. Add integration tests for endpoints
8. Update `backend/ARCHITECTURE.md` if needed

### Adding a New Feature (Frontend)

1. Create new feature: `frontend/src/features/[feature]/`
2. Create domain types and validation
3. Create API client in infrastructure layer
4. Create use case hook in application layer
5. Create UI components in presentation layer
6. Add component tests
7. Update `frontend/ARCHITECTURE.md` if needed

### Adding a New Database Table

1. Update `backend/prisma/schema.prisma`
2. Create migration: `make db-migrate-create name=add_table_name`
3. Apply migration: `make db-migrate`
4. Create corresponding entity in domain layer
5. Create repository interface and implementation

## Troubleshooting

### Services won't start
```bash
make clean  # Remove all containers and volumes
make start  # Fresh start
```

### Database issues
```bash
make db-push  # Reset schema (dev only, loses data)
make db-migrate  # Apply pending migrations
```

### Port conflicts
Check `ops/docker/docker-compose.yml` for port mappings and adjust if needed.

## Environment Variables

- Backend: Create `backend/.env` from `backend/.env.example`
- Frontend: Create `frontend/.env.local` from `frontend/.env.example`
- Never commit `.env` files

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
