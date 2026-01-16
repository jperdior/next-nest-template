# INVARIANTS.md

- Status: Active
- Description: Non-negotiable rules, constraints, system intent, and architectural invariants.

## Architectural Invariants

### Domain-Driven Design (Backend)

**⚠️ CRITICAL**: This project follows TRUE DDD with bounded contexts!

- **Bounded Contexts** (`src/`) are where ALL domain logic lives:
  - **Domain Layer**: Pure business logic (entities, value objects, domain services, repository interfaces)
  - **Application Layer**: Domain use cases (reusable business operations)
  - **Infrastructure Layer**: External concerns (Prisma repositories)
  - Each context exports a NestJS module with its use cases
  - Each context has its own aggregates (entities may differ between contexts)

- **Shared Kernel** (`src/shared/`) provides common primitives:
  - `AggregateRoot` base class - all aggregates MUST extend this
  - `DomainEvent` base class - all domain events MUST extend this
  - Shared Prisma setup at `src/shared/infrastructure/persistence/`

- **Applications** (`apps/`) are THIN layers with NO domain logic:
  - **Presentation Layer**: HTTP controllers, CLI commands (delegates to contexts)
  - Apps MUST NOT contain entities, repositories, or business rules
  - Apps MUST import bounded context modules
  - Controllers MUST be thin - delegate to context use cases

- **Architectural Rules**:
  - Domain layer MUST NOT depend on infrastructure or presentation layers
  - Application layer MAY depend on domain layer only
  - Infrastructure and presentation layers MAY depend on domain and application layers
  - Contexts MUST NOT directly access each other's repositories
  - Apps MUST NOT duplicate domain logic from contexts
  - All aggregates MUST extend `AggregateRoot` from `@testproject/shared`

### Clean Architecture (Frontend)

- The frontend MUST follow Clean Architecture with feature-based organization.
- Each feature MUST contain:
  - **Domain Layer**: Types, entities, validation (Zod schemas)
  - **Application Layer**: Use cases and custom hooks
  - **Infrastructure Layer**: API clients, storage adapters
  - **Presentation Layer**: UI components and pages
- Domain layer MUST NOT depend on React or Next.js specifics.
- Infrastructure MUST NOT leak into presentation.

### Dependency Rules

- **Inner layers MUST NOT depend on outer layers**
- Dependencies flow inward: Presentation → Application → Domain
- Infrastructure implements interfaces defined in Domain
- Use dependency injection to wire dependencies

## Type Safety Invariants

- **Strict TypeScript**: `strict: true` in all tsconfig files is mandatory.
- **No `any`**: Use proper types or `unknown` with type guards.
- **Runtime Validation**: Use Zod for all external inputs.
- **Type Inference**: Prefer inferring types over explicit declarations where clear.

## Testing Invariants

- **Test Coverage**: All new features MUST include tests.
  - Backend: Unit tests for domain logic, integration tests for endpoints
  - Frontend: Component tests for UI, hook tests for logic
- **Test Isolation**: Tests must not depend on external services.
- **Fast Tests**: Unit tests should run in milliseconds.

## Security Invariants

- **No Secrets in Code**: All secrets MUST be in environment variables.
- **Input Validation**: All external inputs MUST be validated.
- **Output Sanitization**: All outputs MUST be sanitized.
- **SQL Injection Prevention**: Use Prisma parameterized queries only.
- **Authentication**: Protected endpoints MUST verify authentication.
- **Authorization**: Operations MUST check user permissions.

## Database Invariants

- **Single Prisma Schema**: Located at `src/shared/infrastructure/persistence/prisma/schema.prisma`
- **Context-Specific Mapping**: Each context maps only the fields it needs from shared tables
- **Prisma Only**: All database access MUST go through Prisma ORM
- **No Direct Database Access**: App code MUST use repositories
- **Transactions**: Multi-step operations MUST use database transactions

## Code Quality Invariants

- **Linting**: All code must pass ESLint with no warnings.
- **Formatting**: All code must be formatted with Prettier.
- **Build**: The project must build without errors.
- **No Console Logs**: Use proper logging library in production code.

## Git & CI/CD Invariants

- **Pre-commit Hooks**: Commits MUST pass lint and test checks.
- **Main Branch Protection**: The `main` branch must always pass.
- **Conventional Commits**: Use conventional commit format.
- **No Force Push**: Never force push to `main` or shared branches.

## Business Logic Invariants

- **Domain Logic in Domain Layer**: Business rules MUST live in domain entities, value objects, or domain services.
- **No Business Logic in Controllers**: Controllers MUST only handle HTTP concerns.
- **No Business Logic in Components**: UI components MUST only handle presentation.
- **Single Responsibility**: Each class/function should have one clear responsibility.

## Performance Invariants

- **Lazy Loading**: Load data and components only when needed.
- **Database Queries**: Avoid N+1 queries.
- **Caching**: Use Redis for frequently accessed data.
- **Pagination**: List endpoints MUST support pagination.

## "Must Never Break" Constraints

- The build pipeline must always pass on `main`.
- The linting pipeline must always pass on `main`.
- The test pipeline must always pass on `main`.
- Docker Compose must successfully start all services.

## Exceptions

Violations require:
1. Explicit documentation of why the exception is necessary
2. Approval from a senior developer or architect
3. Comment in code explaining the exception
4. Plan to remove the exception in the future (if temporary)
