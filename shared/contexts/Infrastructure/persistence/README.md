# Shared Database Infrastructure

This package (`@testproject/database`) provides the Prisma client for all bounded contexts.

## Organization

All models are in `prisma/schema.prisma`, organized by context:

```prisma
// ====== CONTEXT NAME ======
model YourModel { ... }
```

## Why Shared?

- Prisma requires single schema for cross-model relationships
- FK constraints work across contexts
- Simplified migration management
- Domain layers stay independent (only reference IDs)

## Adding Models

1. Add model to `prisma/schema.prisma` under appropriate context section
2. Create migration: `make db-migrate-create name=add_your_model`
3. Repositories import this package: `import { PrismaService } from '@testproject/database'`

## Key Principles

- **Prisma layer**: Plain TypeScript types, FK relationships
- **Repository layer**: Transforms to domain entities
- **Domain layer**: Rich entities, no knowledge of Prisma

## Migrations

Migrations are managed at the infrastructure level and run automatically on container startup.

Manual commands:

```bash
make db-migrate-create name=your_migration
make db-migrate-deploy
make db-studio
```
