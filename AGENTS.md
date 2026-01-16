# AGENTS.md - Operational Guide

Quick reference for development commands and workflows.

## Project Overview

DDD-based monorepo with:
- **Bounded Contexts** (`shared/contexts/`) - Domain logic
- **Application Modules** (`modules/`) - Thin HTTP/UI layers
- **Shared Infrastructure** - Postgres, Redis, RabbitMQ, Traefik

📖 **For architecture details**: See [DDD_GUIDE.md](./DDD_GUIDE.md)

## Quick Start

```bash
# Start everything
make start

# Or start infrastructure, then specific modules
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
make start                # Start infrastructure + all modules
make stop                 # Stop all services
make restart              # Restart all services
make logs                 # View all logs
make clean                # Remove containers and volumes
```

### Module-Specific

```bash
make start-user-app       # Start user-app module
make start-backoffice     # Start backoffice module
make logs-user-app        # View user-app logs
make logs-backoffice      # View backoffice logs
make shell-user-app-be    # Shell into user-app backend
make shell-backoffice-fe  # Shell into backoffice frontend
```

### Testing

```bash
make test                 # Run tests for all modules
make test-user-app        # Run tests for user-app
make test-backoffice      # Run tests for backoffice
make lint                 # Lint all code
make lint-fix             # Auto-fix linting issues
```

### Database

```bash
# Shared schema (default)
make db-migrate-create name=add_field    # Create migration
make db-migrate-deploy                   # Apply migrations
make db-generate                         # Generate Prisma client
make db-studio                           # Open Prisma Studio

# Module-specific schema (if module has own schema)
cd modules/[module] && make db-migrate-create name=add_field
```

### Code Generation

```bash
make codegen              # Generate types from OpenAPI specs
```

## Module Commands

Navigate to a module: `cd modules/[module-name]`

```bash
make start                # Start this module (requires infrastructure)
make stop                 # Stop this module
make logs                 # View logs
make test                 # Run tests
make lint                 # Lint code
make lint-fix             # Auto-fix linting
make shell-be             # Backend container shell
make shell-fe             # Frontend container shell
make codegen              # Generate types from OpenAPI spec
```

## Common Workflows

### Adding a New Module

```text
Use Cursor command: /create-module
```

The AI will guide you through module creation.

### Adding a New Bounded Context

See [shared/contexts/CREATING_CONTEXTS.md](./shared/contexts/CREATING_CONTEXTS.md) for step-by-step guide.

### Adding a New HTTP Endpoint

1. Update module's `specs/openapi.yaml`
2. Run `make codegen`
3. Implement controller (thin - delegates to context use cases)
4. Add tests

📖 **Details**: Module `backend/AGENTS.md` files

### Adding Domain Logic

⚠️ **Domain logic goes in bounded contexts, NOT in modules!**

1. Identify or create bounded context in `shared/contexts/`
2. Implement entities, value objects, use cases
3. Export via context's NestJS module
4. Import context in module's `app.module.ts`

📖 **Details**: [DDD_GUIDE.md](./DDD_GUIDE.md)

## Access URLs

After `make start`:

| Service | URL |
|---------|-----|
| User App Frontend | [http://localhost:3000](http://localhost:3000) |
| User App Backend | [http://localhost:3001](http://localhost:3001) |
| Backoffice Frontend | [http://localhost:3010](http://localhost:3010) |
| Backoffice Backend | [http://localhost:3011](http://localhost:3011) |
| Traefik Dashboard | [http://localhost:8081](http://localhost:8081) |
| RabbitMQ Management | [http://localhost:15672](http://localhost:15672) (guest/guest) |

## Troubleshooting

### Services won't start

```bash
make clean
make start
```

### Database issues

```bash
make db-migrate-deploy
make db-generate
```

### Port conflicts

Check `ops/docker-compose.yml` and module compose files for port mappings.

## Key Principles

- **Modules are THIN** - no domain logic
- **Domain logic in contexts** - reusable across modules
- **Controllers delegate** to context use cases
- **Tests required** - write tests alongside code

📖 **Full documentation**:
- [DDD_GUIDE.md](./DDD_GUIDE.md) - Architecture reference
- [INVARIANTS.md](./INVARIANTS.md) - Non-negotiable rules
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution process
- Module-specific: `modules/*/backend/AGENTS.md` and `modules/*/frontend/AGENTS.md`
