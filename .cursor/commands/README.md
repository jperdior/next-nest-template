# Cursor Commands

Custom commands for AI-assisted development in this project.

## Available Commands

### `/create-module`

Creates a new module with frontend and/or backend scaffolding.

**Usage:**
```
/create-module
```

**What it does:**
1. Asks for module name (validated)
2. Asks what to include (frontend, backend, or both)
3. Automatically assigns unique ports
4. Scaffolds complete module structure
5. Creates Docker configuration
6. Creates Makefile with module commands
7. Creates OpenAPI spec (if backend)
8. Updates root orchestration
9. Optionally adds root Makefile commands

**Example:**
```
/create-module

Module name: analytics
Type: Both frontend and backend
Purpose: Analytics dashboard

Result:
  modules/analytics/
    ├── frontend/
    ├── backend/
    ├── ops/
    ├── specs/
    ├── Makefile
    └── README.md
```

**After creation:**
- Frontend available at: http://localhost:3020
- Backend available at: http://localhost:3021
- Ready to customize and develop

## Adding New Commands

To add a new command:

1. Create a new file in `.cursor/commands/` named after your command
2. Write clear instructions for the AI agent
3. Include validation steps
4. Document in this README

## Command Format

Each command file should:
- Start with `## command-name` heading
- Provide clear step-by-step instructions
- Include validation requirements
- Show example outputs
- Document important notes

## Project Context

This project uses a **module-based monorepo** architecture where:
- Each module has its own frontend and/or backend
- Modules share infrastructure (Postgres, Redis, RabbitMQ, Traefik)
- Modules share database schema via `@testproject/database`
- Modules can be developed and deployed independently
