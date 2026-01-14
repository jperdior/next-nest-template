# CONTRIBUTING.md

- Status: Active
- Description: Repository governance rules and contribution guidelines.

## How to Submit Changes

### Branching Strategy

- **Main Branch**: `main` - always deployable, protected
- **Feature Branches**: `feature/your-feature-name`
- **Fix Branches**: `fix/bug-description`
- **Chore Branches**: `chore/task-description`

Create feature branches from `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/add-user-authentication
```

### Commit Messages

Use **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change or bug fix)
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Examples:**
```
feat(backend): add user authentication with JWT

Implement JWT-based authentication for API endpoints.
Includes login, logout, and token refresh endpoints.

Closes #123
```

```
fix(frontend): resolve infinite loop in useItems hook

The dependency array was missing itemId, causing the effect
to run on every render.
```

### Pull Request Process

1. **Create a Pull Request** against `main`
2. **Title**: Use conventional commit format
3. **Description**: Include:
   - What changed and why
   - How to test the changes
   - Screenshots (if UI changes)
   - Link to related issues
4. **Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Tests added/updated
   - [ ] Tests pass locally
   - [ ] Linting passes
   - [ ] Documentation updated (if needed)
   - [ ] No breaking changes (or documented)

### PR Review Process

- All PRs require at least one approval
- Address review comments before merging
- Keep PRs focused and reasonably sized (< 500 lines preferred)
- Rebase on `main` if conflicts arise

### Merging

- **Squash and Merge** for feature branches (keeps history clean)
- **Rebase and Merge** for hotfixes (preserves individual commits)
- Delete branch after merge

## Development Workflow

### 1. Setup Environment

```bash
# Clone repository
git clone <repository-url>
cd your-project   # Replace with your project name

# Initialize project with your custom name
make init

# Start development environment (all services in Docker)
make start
```

**Note:** All development happens inside Docker containers. No local Node.js or pnpm installation required.

### 2. Make Changes

**⚠️ Important**: Understand where your changes should go!

**Adding domain logic?** → Modify or create a bounded context (`shared/contexts/`)
- Entities, value objects, domain services
- Reusable business operations (use cases)
- Database schema and repositories

**Adding app-specific features?** → Modify a module (`modules/`)
- HTTP controllers (thin!)
- App-specific orchestration (registration flow, notifications)
- Frontend UI and pages

See `DDD_GUIDE.md` for detailed patterns.

**Development practices**:
- Follow architecture patterns (see `ARCHITECTURE.md`, `DDD_GUIDE.md`)
- Write tests alongside code
- Run tests frequently: `make test`
- Lint code: `make lint-fix`

### 3. Pre-commit

Pre-commit hooks automatically run:
- Linting with auto-fix
- Tests for changed files

If hooks fail, fix issues before committing.

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create PR on GitHub/GitLab with description and checklist.

## Code Standards

### TypeScript

- Use strict mode
- Avoid `any` - use proper types
- Prefer interfaces for object shapes
- Use Zod for runtime validation

### Backend (NestJS)

- Follow DDD principles (see `backend/ARCHITECTURE.md`)
- Use dependency injection
- Repository pattern for data access
- Validate DTOs with class-validator or Zod

### Frontend (Next.js)

- Follow Clean Architecture (see `frontend/ARCHITECTURE.md`)
- Server Components by default
- Custom hooks for business logic
- Tailwind CSS for styling

### Testing

- Unit tests for business logic
- Integration tests for endpoints/pages
- Test file naming: `*.spec.ts` or `*.spec.tsx`
- Descriptive test names: `it('should create user when valid data provided')`

### Documentation

- Update `README.md` if setup changes
- Update `ARCHITECTURE.md` if architecture changes
- Add JSDoc comments for public APIs
- Keep documentation in sync with code

## Project Structure

- `backend/` - NestJS API
- `frontend/` - Next.js application
- `ops/` - Docker and infrastructure
- Documentation files at root and in `backend/` and `frontend/`

## Testing

```bash
# Run all tests
make test

# Run backend tests only
make test-be

# Run frontend tests only
make test-fe

# Watch mode (requires shell in container)
make shell-be  # then: pnpm test:watch
make shell-fe  # then: pnpm test:watch
```

## Linting

```bash
# Lint all code
make lint

# Auto-fix issues
make lint-fix
```

**Note:** Prettier is integrated with ESLint and runs automatically with `make lint-fix`.

## Database Changes

### Creating Migrations

```bash
# 1. Update schema in backend/prisma/schema.prisma
# 2. Create migration
make db-migrate-create name=add_users_table

# 3. Apply migration
make db-migrate
```

### Seeding Data

Update `backend/prisma/seed.ts` and run:
```bash
make db-seed
```

## Reporting Issues

### Bug Reports

Open an issue with:
- **Title**: Clear, concise description
- **Description**:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Environment (OS, Node version, etc.)
  - Screenshots/logs (if applicable)

**Template:**
```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: macOS 14.0
- Node: 20.10.0
- Browser: Chrome 120

## Screenshots
[If applicable]
```

### Feature Requests

Open an issue with:
- **Title**: Feature name
- **Description**:
  - Problem being solved
  - Proposed solution
  - Alternatives considered
  - Additional context

## Getting Help

- Check existing documentation first
- Search existing issues
- Ask in discussions/chat (if available)
- Create an issue for persistent problems

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## Questions?

If you have questions about contributing, please open an issue labeled `question`.
