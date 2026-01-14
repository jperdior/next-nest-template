# Migration Guide: Module-Based Architecture

This document explains the migration from a single frontend/backend structure to a module-based monorepo architecture.

## What Changed

### Before (Single Frontend + Backend)

```
dungeonman/
├── backend/          # Single NestJS backend
├── frontend/         # Single Next.js frontend
├── ops/docker/       # Docker configs
├── specs/            # OpenAPI spec
└── packages/
    └── api-types/    # Generated types
```

### After (Module-Based Monorepo)

```
dungeonman/
├── modules/
│   ├── user-app/     # User-facing module (frontend + backend + spec)
│   └── backoffice/   # Admin module (frontend + backend + spec)
├── shared/
│   ├── database/     # Shared Prisma schema
│   └── packages/
│       ├── auth/     # JWT and role utilities
│       └── ui/       # Shared UI components
├── infra/            # Shared infrastructure (Postgres, Redis, etc.)
└── ops/              # Root orchestration
```

## Key Changes

### 1. Module Structure

Each module now contains:
- Its own **frontend** (Next.js)
- Its own **backend** (NestJS)
- Its own **OpenAPI spec** (`specs/openapi.yaml`)
- Its own **Docker configuration** (`ops/`)
- Its own **Makefile** with module-specific commands

### 2. Shared Database

The Prisma schema moved from `backend/prisma/` to `shared/database/prisma/`.

**Before:**
```typescript
import { PrismaClient } from '@prisma/client';
```

**After:**
```typescript
import { PrismaClient } from '@dungeonman/database';
```

### 3. Shared Auth Package

New package at `shared/packages/auth/` provides JWT utilities:

```typescript
import { decodeJWT, extractUser, hasRole, UserRole } from '@dungeonman/auth';
```

### 4. Infrastructure Separation

Infrastructure services (Postgres, Redis, RabbitMQ, Traefik) moved to `infra/docker-compose.yml` and can run independently.

### 5. Command Changes

| Old Command | New Command(s) |
|-------------|----------------|
| `make start` | `make start` (starts everything) |
| `make logs-be` | `make logs-user-app` or `make logs-backoffice` |
| `make logs-fe` | Module-specific logs |
| `make shell-be` | `make shell-user-app-be` or `make shell-backoffice-be` |
| `make shell-fe` | `make shell-user-app-fe` or `make shell-backoffice-fe` |
| `make test-be` | `make test-user-app` or `make test-backoffice` |
| `make db-migrate-create` | Same (works at shared database level) |

## Migration Steps (If Migrating Existing Code)

### 1. Update Imports

**Backend - PrismaClient:**
```diff
- import { PrismaClient } from '@prisma/client';
+ import { PrismaClient } from '@dungeonman/database';
```

**Backend - Remove Prisma scripts from package.json:**
The Prisma commands now live in `shared/database/package.json`.

### 2. Update Docker Compose

Modules now reference the shared infrastructure network:

```yaml
networks:
  dungeonman_network:
    external: true  # Changed from 'driver: bridge'
```

### 3. Update pnpm Workspace

Workspace paths updated:
```yaml
packages:
  - 'modules/*/backend'
  - 'modules/*/frontend'
  - 'shared/database'
  - 'shared/packages/*'
```

### 4. Install Dependencies

After migration:
```bash
# Install all dependencies
pnpm install

# Generate Prisma client
cd shared/database && pnpm generate
```

## New Workflows

### Starting Development

```bash
# Option 1: Start everything
make start

# Option 2: Start infrastructure, then specific modules
make start-infra
make start-user-app
# backoffice stays stopped
```

### Working on a Single Module

```bash
# Navigate to module
cd modules/user-app

# Module commands
make start
make logs
make test
make shell-be
make shell-fe
```

### Database Operations

All database operations work at the shared level:

```bash
# From project root
make db-migrate-create name=add_users_table
make db-migrate
make db-studio
make db-seed
```

### Adding New Modules

```bash
# 1. Copy existing module
cp -r modules/user-app modules/analytics

# 2. Update module configuration
cd modules/analytics
# Edit package.json, Makefile, docker-compose.yml

# 3. Add to root orchestration
# Edit ops/docker-compose.yml to include new module

# 4. Start it
make start
```

## Benefits of New Structure

### 1. **Scalability**
- Add new applications (modules) without affecting existing ones
- Each module can be deployed independently

### 2. **Team Organization**
- Teams can own entire modules (frontend + backend)
- Clear boundaries between modules

### 3. **Shared Code**
- Database schema shared via `@dungeonman/database`
- Auth logic shared via `@dungeonman/auth`
- UI components shared via `@dungeonman/ui`

### 4. **Flexible Infrastructure**
- Modules can share or have isolated databases
- Infrastructure can scale independently
- Easy to add module-specific services

### 5. **Development Flexibility**
- Run only the modules you're working on
- Faster development cycles
- Better resource usage

## Access URLs

After `make start`:

### User App
- Frontend: http://localhost:3000 or http://user.local:8080
- Backend: http://localhost:3001 or http://api.user.local:8080

### Backoffice
- Frontend: http://localhost:3010 or http://admin.local:8080
- Backend: http://localhost:3011 or http://api.admin.local:8080

### Infrastructure
- Traefik Dashboard: http://localhost:8081
- RabbitMQ Management: http://localhost:15672
- Prisma Studio: http://localhost:5555

## Port Allocation

| Service | Port |
|---------|------|
| **Infrastructure** | |
| Traefik HTTP | 8080 |
| Traefik Dashboard | 8081 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ AMQP | 5672 |
| RabbitMQ Management | 15672 |
| **User App** | |
| Frontend | 3000 |
| Backend | 3001 |
| Prisma Studio | 5555 |
| **Backoffice** | |
| Frontend | 3010 |
| Backend | 3011 |
| Prisma Studio | 5556 |

## Troubleshooting

### "Network not found" Error

If you see network errors:
```bash
# Make sure infrastructure is started first
make start-infra

# Or start everything together
make start
```

### Port Conflicts

Check if ports are in use:
```bash
# macOS/Linux
lsof -i :3000
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
cd shared/database
pnpm generate
```

### Module Won't Start

```bash
# Check logs
cd modules/user-app
make logs

# Restart module
make restart
```

## Questions?

- See [README.md](./README.md) for project overview
- See [AGENTS.md](./AGENTS.md) for detailed operational guide
- See module-specific READMEs in `modules/*/README.md`
