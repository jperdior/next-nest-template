# Frontend - Agent Guidelines

## Commands

**Note:** All commands run inside Docker containers.

```bash
# From project root (runs in Docker)
make test-fe            # Run frontend tests
make lint               # Lint all code
make lint-fix           # Auto-fix linting issues

# From inside frontend container (make shell-fe)
pnpm dev                # Development server (already running in Docker)
pnpm build              # Production build
pnpm test               # Run tests
pnpm test:watch         # Watch mode
pnpm lint               # Lint code
```

## Structure Rules

- **Domain**: Types and Zod schemas only
- **Application**: Custom hooks with business logic
- **Infrastructure**: API clients, no business logic
- **Presentation**: UI components, use hooks for logic

## Component Patterns

- Server Components by default
- 'use client' only when needed (hooks, events, state)
- Tailwind CSS for styling
- Test all components
