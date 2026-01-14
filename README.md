# NEXT + NEST template

Full-stack TypeScript template with NestJS backend, Next.js frontend, and Docker development environment.

## Tech Stack

### Backend
- **NestJS** - TypeScript Node.js framework
- **Prisma** - Type-safe ORM with PostgreSQL
- **Domain-Driven Design** - Clean architecture with bounded contexts
- **Jest** - Unit and integration testing

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety across the stack
- **Tailwind CSS** - Utility-first styling
- **Clean Architecture** - Feature-based organization

### Infrastructure
- **Docker & Docker Compose** - Containerized development
- **Traefik** - Reverse proxy with local domain routing
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching layer
- **RabbitMQ 3** - Message broker

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- pnpm 9+

### First Time Setup

When using this template, initialize it with your project name:

```bash
# Initialize the project
make init

# Follow the prompts to set your project name
# Then update your /etc/hosts file as instructed
```

See [INIT.md](./INIT.md) for detailed initialization instructions.

### Start Development Environment

```bash
# Start all services
make start

# Access services (replace 'yourproject' with your project name)
# Frontend:  http://frontend.yourproject
# Backend:   http://backend.yourproject
# Traefik:   http://traefik.yourproject
# RabbitMQ:  http://rabbitmq.yourproject (guest/guest)

# View logs
make logs

# Stop services
make stop
```

### Local Development (without Docker)

```bash
# Install dependencies
pnpm install

# Start backend (requires PostgreSQL, Redis, RabbitMQ)
cd backend
pnpm dev

# Start frontend (in another terminal)
cd frontend
pnpm dev
```

## Project Structure

```
dungeonman/
├── backend/          # NestJS API with DDD
├── frontend/         # Next.js application
├── ops/              # Docker and infrastructure
├── Makefile          # Development commands
└── [docs]            # Documentation files
```

## Development Commands

| Command | Description |
|---------|-------------|
| `make init` | Initialize project with custom name |
| `make start` | Start all Docker services |
| `make stop` | Stop all services |
| `make logs` | View all logs |
| `make test` | Run all tests |
| `make lint` | Lint all code |
| `make db-migrate` | Run database migrations |
| `make db-studio` | Open Prisma Studio |

See `Makefile` for full list of commands or run `make help`.

## Database Migrations

```bash
# Create a new migration
make db-migrate-create name=add_users_table

# Apply migrations
make db-migrate

# Open Prisma Studio (database GUI)
make db-studio
```

## Testing

```bash
# Run all tests
make test

# Run backend tests only
make test-be

# Run frontend tests only
make test-fe
```

## Documentation

- [INIT.md](./INIT.md) - Project initialization guide
- [CLAUDE.md](./CLAUDE.md) - AI assistant orchestration rules
- [AGENTS.md](./AGENTS.md) - Operational guide for developers and AI
- [INVARIANTS.md](./INVARIANTS.md) - Non-negotiable architectural rules
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md) - Backend architecture
- [frontend/ARCHITECTURE.md](./frontend/ARCHITECTURE.md) - Frontend architecture

## Architecture

This template follows:
- **Backend**: Domain-Driven Design with hexagonal architecture
- **Frontend**: Clean architecture with feature-based organization
- **Testing**: Unit tests for business logic, integration tests for endpoints/components
- **Type Safety**: Strict TypeScript across the stack

See individual `ARCHITECTURE.md` files for detailed information.

## License

MIT
