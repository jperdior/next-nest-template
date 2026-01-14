# @dungeonman/database

Shared database schema and Prisma client used by all modules.

## Purpose

This package contains:
- Prisma schema (`prisma/schema.prisma`)
- Database migrations (`prisma/migrations/`)
- Seed scripts (`prisma/seed.ts`)
- Generated Prisma client

All modules that need database access import this package instead of having their own Prisma setup.

## Usage

### In Backend Modules

```typescript
import { PrismaClient } from '@dungeonman/database';

// Or use the PrismaService wrapper
import { PrismaService } from './shared/database/prisma.service';
```

### Commands

From project root:

```bash
# Generate Prisma client
cd shared/database && pnpm generate

# Create a new migration
make db-migrate-create name=add_users_table

# Apply migrations
make db-migrate

# Push schema changes (dev only)
make db-push

# Open Prisma Studio
make db-studio

# Seed database
make db-seed
```

## Structure

```
shared/database/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.ts            # Seed data script
├── src/
│   └── index.ts           # Exports PrismaClient
├── package.json
└── tsconfig.json
```

## Schema Location

Edit the schema: `shared/database/prisma/schema.prisma`

After editing, create a migration:
```bash
make db-migrate-create name=descriptive_name
```

## Adding a New Table

1. Edit `prisma/schema.prisma`:
   ```prisma
   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. Create migration:
   ```bash
   make db-migrate-create name=add_users_table
   ```

3. Apply migration:
   ```bash
   make db-migrate
   ```

4. Update seed script if needed: `prisma/seed.ts`

## Shared by Modules

All modules that import `@dungeonman/database` share:
- Same database instance (PostgreSQL)
- Same schema
- Same migrations
- Same Prisma client

This ensures data consistency across modules.
