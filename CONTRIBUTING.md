# CONTRIBUTING.md

Guidelines for contributing to this repository.

## Branching Strategy

- **Main Branch**: `main` - always deployable, protected
- **Feature Branches**: `feature/your-feature-name`
- **Fix Branches**: `fix/bug-description`
- **Chore Branches**: `chore/task-description`

```bash
git checkout main
git pull origin main
git checkout -b feature/add-user-authentication
```

## Commit Messages

Use **Conventional Commits** format:

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(auth): add user registration endpoint
fix(frontend): resolve infinite loop in useItems hook
```

## Pull Request Process

1. Create PR against `main`
2. Title: Use conventional commit format
3. Include: what changed, how to test, screenshots (if UI)
4. Checklist:
   - [ ] Tests added/updated
   - [ ] Tests pass locally
   - [ ] Linting passes
   - [ ] Documentation updated (if needed)

## Development Workflow

### 1. Setup

```bash
git clone <repository-url>
cd dungeonman
make start
```

All development happens in Docker containers.

### 2. Where Do Changes Go?

**⚠️ Understand the architecture before making changes!**

| Change Type | Location | Description |
|-------------|----------|-------------|
| Domain logic | `src/[context]/` | Entities, use cases, repositories |
| HTTP controllers | `apps/[app]/backend/` | Thin controllers that delegate |
| Frontend features | `apps/[app]/frontend/` | Clean Architecture features |
| Database schema | `src/shared/infrastructure/persistence/prisma/` | Prisma schema |

See [DDD_GUIDE.md](./DDD_GUIDE.md) for architecture details.

### 3. Development Commands

```bash
# Run tests
make test-user-app
make test-backoffice

# Lint code
make lint
make lint-fix

# Open shell in container
make shell-user-app-be
make shell-user-app-fe
make shell-backoffice-be
make shell-backoffice-fe
```

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` - use proper types
- Use Zod for runtime validation

### Backend

- Apps are THIN - delegate to bounded contexts
- See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)

### Frontend

- Server Components by default
- Clean Architecture with features
- See [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)

### Testing

- Unit tests for business logic
- Integration tests for endpoints
- Test file naming: `*.spec.ts` or `*.spec.tsx`
- Write tests alongside code, not after

## Database Changes

```bash
# Schema location
# src/shared/infrastructure/persistence/prisma/schema.prisma

# Create migration
make db-migrate-create name=add_users_table

# Apply migration
make db-migrate-deploy

# Open Prisma Studio
make db-studio
```

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs if applicable

### Feature Requests

Include:
- Problem being solved
- Proposed solution
- Alternatives considered

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
