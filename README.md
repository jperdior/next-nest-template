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

### First Time Setup (Required)

**Important:** This template comes with a default project name `testproject`. Before starting development, you should initialize it with your own project name.

```bash
# Initialize the project with your custom name
make init

# Enter your project name when prompted (e.g., "myproject")
# The script will automatically update your /etc/hosts file (requires sudo)
```

**What happens if you skip initialization?**

If you try to run `make start` with the default `testproject` name, you'll see:

```
⚠️  Warning: Using default template project name 'testproject'

This appears to be an uninitialized template.
It's recommended to run 'make init' to set a custom project name.

Continue with 'testproject' anyway? (y/N):
```

While you can continue with the default name, **it's strongly recommended to initialize properly** to avoid conflicts with other projects using this template.

**What happens during initialization?**
- You choose a custom project name
- Configuration files are automatically updated
- `/etc/hosts` is automatically configured (requires sudo on macOS/Linux)
- Access URLs are displayed

See [INIT.md](./INIT.md) for detailed initialization instructions.

### Start Development Environment

After initialization, start your services:

```bash
# Start all services
make start

# Access services (replace 'yourproject' with your actual project name)
# Via custom domains (through Traefik):
#   Frontend:  http://frontend.yourproject:8082
#   Backend:   http://backend.yourproject:8082
#   Traefik:   http://traefik.yourproject:8082
#   RabbitMQ:  http://rabbitmq.yourproject:8082 (guest/guest)
#
# Or via direct ports:
#   Frontend:  http://localhost:8080
#   Backend:   http://localhost:8081
#   Traefik:   http://localhost:8083
#   RabbitMQ:  http://localhost:15672 (guest/guest)

# View logs
make logs

# Stop services
make stop
```

**Note:** The `make init` command automatically configures your `/etc/hosts` file (requires sudo on macOS/Linux).

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
your-project/
├── backend/          # NestJS API with DDD
├── frontend/         # Next.js application
├── ops/              # Docker and infrastructure
│   └── docker/       # Docker Compose and Traefik config
├── Makefile          # Development commands (run 'make help')
├── INIT.md           # Initialization guide
└── [docs]            # Architecture and contribution docs
```

## Development Commands

| Command | Description |
|---------|-------------|
| `make init` | **Initialize project with custom name (run first!)** |
| `make start` | Start all Docker services |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View all logs |
| `make logs-be` | View backend logs only |
| `make logs-fe` | View frontend logs only |
| `make test` | Run all tests |
| `make lint` | Lint all code |
| `make db-migrate` | Run database migrations |
| `make db-studio` | Open Prisma Studio |
| `make clean` | Remove containers, volumes, and build artifacts |

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
