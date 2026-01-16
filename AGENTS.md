# AGENTS.md - Operational Guide

Quick reference for development commands and workflows.

## Project Overview

DDD-based monorepo with:
- **Bounded Contexts** (`src/`) - Domain logic organized by context
- **Applications** (`apps/`) - Thin HTTP/UI layers
- **Shared Infrastructure** - Postgres, Redis, RabbitMQ, Traefik

📖 **For architecture details**: See [DDD_GUIDE.md](./DDD_GUIDE.md)

## Quick Start

```bash
# Start everything
make start

# Or start infrastructure, then specific apps
make start-infra
make start-user-app
make start-backoffice
```

## Root Commands

### Infrastructure

```bash
make start-infra          # Start shared infrastructure
make stop-infra           # Stop infrastructure
```

### All Services

```bash
make start                # Start infrastructure + all apps
make stop                 # Stop all services
make restart              # Restart all services
make logs                 # View all logs
make clean                # Remove containers and volumes
```

### App-Specific

```bash
make start-user-app       # Start user-app
make start-backoffice     # Start backoffice
make logs-user-app        # View user-app logs
make logs-backoffice      # View backoffice logs
make shell-user-app-be    # Shell into user-app backend
make shell-backoffice-fe  # Shell into backoffice frontend
```

### Testing

```bash
make test                 # Run tests for all apps
make test-user-app        # Run tests for user-app
make test-backoffice      # Run tests for backoffice
make lint                 # Lint all code
make lint-fix             # Auto-fix linting issues
```

### Database

```bash
make db-migrate-create name=add_field    # Create migration
make db-migrate-deploy                   # Apply migrations
make db-generate                         # Generate Prisma client
make db-studio                           # Open Prisma Studio
```

### Code Generation

```bash
make codegen              # Generate types from OpenAPI specs
```

## Project Structure

```
dungeonman/
├── apps/                           # Application layer (thin)
│   ├── user-app/                   # User-facing application
│   │   ├── backend/                # NestJS API
│   │   └── frontend/               # Next.js UI
│   └── backoffice/                 # Admin application
│       ├── backend/                # NestJS API
│       └── frontend/               # Next.js UI
│
├── src/                            # Bounded Contexts (domain logic)
│   ├── backoffice/                 # Backoffice context
│   │   └── user/                   # User aggregate (admin view)
│   ├── user-facing-app/            # UserFacingApp context
│   │   └── user/                   # User aggregate (auth-focused)
│   └── shared/                     # Shared Kernel
│       ├── domain/                 # AggregateRoot, DomainEvent, etc.
│       └── infrastructure/         # Shared Prisma setup
│
└── shared/                         # Shared packages
    └── packages/                   # Auth, UI, etc.
```

## Common Workflows

### Adding a New App

```text
Use Cursor command: /create-app
```

### Adding a New Bounded Context

1. Create directory under `src/[context-name]/`
2. Add domain layer (entities, value objects, repository interfaces)
3. Add application layer (use cases)
4. Add infrastructure layer (Prisma repository implementation)
5. Create NestJS module exporting use cases
6. Add to `pnpm-workspace.yaml`

### Adding a New HTTP Endpoint

1. Update app's `specs/openapi.yaml`
2. Run `make codegen`
3. Implement controller (thin - delegates to context use cases)
4. Add tests

📖 **Details**: App `backend/AGENTS.md` files

### Adding Domain Logic

⚠️ **Domain logic goes in bounded contexts, NOT in apps!**

1. Identify or create bounded context in `src/`
2. Implement entities, value objects, use cases
3. Export via context's NestJS module
4. Import context in app's `app.module.ts`

📖 **Details**: [DDD_GUIDE.md](./DDD_GUIDE.md)

## Access URLs

After `make start`:

### Recommended (via Traefik)

| Service | URL |
|---------|-----|
| User App Frontend | [http://user.local:8080](http://user.local:8080) |
| User App Backend API | [http://api.user.local:8080](http://api.user.local:8080) |
| Backoffice Frontend | [http://admin.local:8080](http://admin.local:8080) |
| Backoffice Backend API | [http://api.admin.local:8080](http://api.admin.local:8080) |
| Traefik Dashboard | [http://traefik.local:8080](http://traefik.local:8080) |
| RabbitMQ Management | [http://rabbitmq.local:8080](http://rabbitmq.local:8080) |

**⚠️ Setup Required:**
Add to `/etc/hosts`:
```
127.0.0.1 user.local api.user.local admin.local api.admin.local traefik.local rabbitmq.local
```

## Key Principles

- **Apps are THIN** - no domain logic
- **Domain logic in contexts** - reusable across apps
- **Controllers delegate** to context use cases
- **Tests required** - write tests alongside code

📖 **Full documentation**:
- [DDD_GUIDE.md](./DDD_GUIDE.md) - Architecture reference
- [INVARIANTS.md](./INVARIANTS.md) - Non-negotiable rules
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution process
- App-specific: `apps/*/backend/AGENTS.md`
