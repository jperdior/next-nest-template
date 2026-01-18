# Cursor Commands

Custom commands for AI-assisted development in this project.

## Available Commands

### `/create-app`

Creates a new thin application with frontend and/or backend scaffolding.

**Usage:**
```
/create-app
```

**What it does:**
1. Asks for app name (validated)
2. Asks what to include (frontend, backend, or both)
3. Automatically assigns unique ports
4. Scaffolds complete app structure
5. Creates Docker configuration with Traefik labels
6. Creates Makefile with app commands
7. Creates OpenAPI spec (if backend)
8. Updates root orchestration
9. Adds root Makefile commands

**Example:**
```
/create-app

App name: analytics
Type: Both frontend and backend
Purpose: Analytics dashboard

Result:
  apps/analytics/
    ├── frontend/
    ├── backend/
    ├── ops/
    ├── specs/
    ├── Makefile
    └── README.md
```

**After creation:**
- Frontend: http://analytics.local:8080 (via Traefik)
- Backend API: http://api.analytics.local:8080 (via Traefik)
- Ready to customize and develop

### `/create-branch`

Creates a new git branch following the branching policy in CONTRIBUTING.md.

**Usage:**
```
/create-branch fix login bug
/create-branch PROJ-123
/create-branch feature add dark mode
```

### `/commit`

Stages all changes and creates a conventional commit message.

**Usage:**
```
/commit
```

### `/validate`

Runs linting, tests, and checks documentation before pushing.

**Usage:**
```
/validate
```

## Adding New Commands

To add a new command:

1. Create a new `.md` file in `.cursor/commands/`
2. Add frontmatter with description
3. Write clear instructions for the AI agent
4. Include validation steps
5. Document in this README

## Command Format

Each command file should have:
- Frontmatter with `description` field
- Clear step-by-step instructions
- Validation requirements
- Example outputs
- Important notes

## Project Context

This project uses a **DDD-based monorepo** architecture where:
- **Bounded contexts** (`src/`) contain domain logic
- **Apps** (`apps/`) are thin HTTP/UI layers that import contexts
- Apps share infrastructure (Postgres, Redis, RabbitMQ, Traefik)
- Apps share database schema at `src/shared/infrastructure/persistence/prisma/`
- Apps can be developed and started independently
