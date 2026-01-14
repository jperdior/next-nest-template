# User App Module

User-facing application module with frontend and backend.

## Purpose

This module provides the public-facing application for end users, including:
- User registration and authentication
- User profile management
- Core application features

## Structure

```
user-app/
├── frontend/         # Next.js user interface
├── backend/          # NestJS API
├── specs/            # OpenAPI specification
├── ops/              # Docker configuration
└── Makefile          # Module commands
```

## Quick Start

### From Module Directory

```bash
# Start this module (requires infrastructure running)
make start

# View logs
make logs

# Run tests
make test

# Open shell
make shell-be   # Backend
make shell-fe   # Frontend
```

### From Project Root

```bash
# Start this module
make start-user-app

# View logs
make logs-user-app

# Run tests
make test-user-app
```

## Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 or http://user.local:8080 |
| Backend API | http://localhost:3001 or http://api.user.local:8080 |

## Development

See module-specific documentation:
- `backend/ARCHITECTURE.md` - Backend architecture
- `backend/TESTING.md` - Backend testing guide
- `frontend/ARCHITECTURE.md` - Frontend architecture
- `frontend/TESTING.md` - Frontend testing guide

## Database

This module uses the shared database package `@dungeonman/database`.

## API Specification

OpenAPI spec: `specs/openapi.yaml`

Generate types: `make codegen`
