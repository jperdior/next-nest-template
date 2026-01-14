# Backoffice Module

Admin panel module with frontend and backend for administrative tasks.

## Purpose

This module provides the administrative interface for managing the application, including:
- User management (list, edit, delete, deactivate)
- Content moderation
- System configuration
- Analytics and reporting

## Structure

```
backoffice/
├── frontend/         # Next.js admin interface
├── backend/          # NestJS admin API
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
make start-backoffice

# View logs
make logs-backoffice

# Run tests
make test-backoffice
```

## Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3010 or http://admin.local:8080 |
| Backend API | http://localhost:3011 or http://api.admin.local:8080 |

## Development

See module-specific documentation:
- `backend/ARCHITECTURE.md` - Backend architecture
- `backend/TESTING.md` - Backend testing guide
- `frontend/ARCHITECTURE.md` - Frontend architecture
- `frontend/TESTING.md` - Frontend testing guide

## Database

This module uses the shared database package `@dungeonman/database`.

## Authentication & Authorization

This module uses role-based access control via `@dungeonman/auth`:
- Only users with `admin` role can access
- JWT tokens include user roles
- Frontend and backend validate roles

## API Specification

OpenAPI spec: `specs/openapi.yaml`

Generate types: `make codegen`
