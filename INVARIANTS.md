# INVARIANTS.md

- Status: Active
- Description: Non-negotiable rules, constraints, system intent, and architectural invariants.

## Architectural Invariants

### Domain-Driven Design (Backend)

- The backend MUST follow Domain-Driven Design principles with clear separation of concerns.
- Each context MUST contain:
  - **Domain Layer**: Pure business logic (entities, value objects, domain services, repository interfaces)
  - **Application Layer**: Use cases that orchestrate domain logic
  - **Infrastructure Layer**: External concerns (database, cache, messaging implementations)
  - **Presentation Layer**: Entry points (HTTP controllers, CLI commands)
- Domain layer MUST NOT depend on infrastructure or presentation layers.
- Application layer MAY depend on domain layer only.
- Infrastructure and presentation layers MAY depend on domain and application layers.

### Clean Architecture (Frontend)

- The frontend MUST follow Clean Architecture with feature-based organization.
- Each feature MUST contain:
  - **Domain Layer**: Types, entities, validation (Zod schemas)
  - **Application Layer**: Use cases and custom hooks
  - **Infrastructure Layer**: API clients, storage adapters
  - **Presentation Layer**: UI components and pages
- Domain layer MUST NOT depend on React or Next.js specifics.
- Infrastructure MUST NOT leak into presentation (components should use hooks, not API clients directly).

### Dependency Rules

- **Inner layers MUST NOT depend on outer layers**
- Dependencies flow inward: Presentation → Application → Domain
- Infrastructure implements interfaces defined in Domain
- Use dependency injection to wire dependencies

## Type Safety Invariants

- **Strict TypeScript**: `strict: true` in all tsconfig files is mandatory.
- **No `any`**: Use proper types or `unknown` with type guards. Explicit `any` requires lint disable with justification.
- **Runtime Validation**: Use Zod for all external inputs (API requests, environment variables).
- **Type Inference**: Prefer inferring types over explicit declarations where clear.

## Testing Invariants

- **Test Coverage**: All new features MUST include tests.
  - Backend: Unit tests for domain logic, integration tests for endpoints
  - Frontend: Component tests for UI, hook tests for logic
- **Test Isolation**: Tests must not depend on external services (use mocks/stubs).
- **Fast Tests**: Unit tests should run in milliseconds, not seconds.
- **Descriptive Tests**: Test descriptions should clearly state what is being tested and expected behavior.

## Security Invariants

- **No Secrets in Code**: All secrets and credentials MUST be in environment variables, never committed.
- **Input Validation**: All external inputs MUST be validated before use.
- **Output Sanitization**: All outputs MUST be sanitized to prevent XSS.
- **SQL Injection Prevention**: Use Prisma parameterized queries, never raw SQL without parameters.
- **Authentication**: Protected endpoints MUST verify authentication.
- **Authorization**: Operations MUST check user permissions.

## Database Invariants

- **Prisma Only**: All database access MUST go through Prisma ORM.
- **Migrations**: Schema changes MUST use Prisma migrations, never manual SQL.
- **No Direct Database Access**: Application code MUST use repositories, never Prisma client directly (except in repository implementations).
- **Transactions**: Multi-step operations affecting data consistency MUST use database transactions.

## Code Quality Invariants

- **Linting**: All code must pass ESLint with no warnings.
- **Formatting**: All code must be formatted with Prettier.
- **Build**: The project must build without errors (`pnpm build`).
- **No Console Logs**: Use proper logging library, not `console.log` in production code.

## Git & CI/CD Invariants

- **Pre-commit Hooks**: Commits MUST pass lint and test checks via Husky.
- **Main Branch Protection**: The `main` branch build and tests must always pass.
- **Conventional Commits**: Use conventional commit format (feat:, fix:, docs:, etc.).
- **No Force Push**: Never force push to `main` or shared branches.

## Business Logic Invariants

- **Domain Logic in Domain Layer**: Business rules MUST live in domain entities, value objects, or domain services.
- **No Business Logic in Controllers**: Controllers MUST only handle HTTP concerns, delegate to use cases.
- **No Business Logic in Components**: UI components MUST only handle presentation, delegate to hooks.
- **Single Responsibility**: Each class/function should have one clear responsibility.

## Performance Invariants

- **Lazy Loading**: Load data and components only when needed.
- **Database Queries**: Avoid N+1 queries, use proper joins or batch loading.
- **Caching**: Use Redis for frequently accessed, slowly changing data.
- **Pagination**: List endpoints MUST support pagination.

## "Must Never Break" Constraints

- The build pipeline (`pnpm build`) must always pass on the `main` branch.
- The linting pipeline (`pnpm lint`) must always pass on the `main` branch.
- The test pipeline (`pnpm test`) must always pass on the `main` branch.
- Docker Compose must successfully start all services.

## Exceptions

Violations of these invariants require:
1. Explicit documentation of why the exception is necessary
2. Approval from a senior developer or architect
3. Comment in code explaining the exception
4. Plan to remove the exception in the future (if temporary)

## Summary

These invariants ensure:
- **Maintainability**: Clean architecture makes changes easier
- **Testability**: Separated concerns enable thorough testing
- **Reliability**: Type safety and tests catch bugs early
- **Security**: Validated inputs and proper auth protect the system
- **Performance**: Best practices prevent common bottlenecks

Violating these invariants creates technical debt that compounds over time. Always follow them unless you have a compelling reason and explicit approval.
