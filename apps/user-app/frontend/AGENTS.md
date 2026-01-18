# User App Frontend - Agent Guidelines

## Quick Links

- **Architecture**: See [FRONTEND_ARCHITECTURE.md](../../../FRONTEND_ARCHITECTURE.md)
- **Testing**: See [TESTING.md](./TESTING.md)

## Commands

From this directory (`apps/user-app/frontend/`):

```bash
pnpm dev                # Development server
pnpm build              # Production build
pnpm test               # Run tests
pnpm test:watch         # Watch mode
pnpm lint               # Lint code
pnpm lint:fix           # Auto-fix
```

From project root:

```bash
make start-user-app       # Start this app
make test-user-app        # Run tests
make shell-user-app-fe    # Open shell in container
```

## Access URLs

- **Frontend**: http://user.local:8080 (via Traefik)
- **Backend API**: http://api.user.local:8080 (via Traefik)

**Required in `/etc/hosts`:**
```
127.0.0.1 user.local api.user.local
```

## Key Principles

- **Server Components** by default
- **'use client'** only when needed (hooks, events, state)
- **Clean Architecture** - features organized by layers
- **Tailwind CSS** for styling

## Adding a New Feature

1. Create feature folder: `src/features/[feature]/`
2. **Domain**: Types and Zod schemas
3. **Infrastructure**: API client
4. **Application**: Custom hooks
5. **Presentation**: UI components
6. **Tests**: Component and hook tests

See [FRONTEND_ARCHITECTURE.md](../../../FRONTEND_ARCHITECTURE.md) for patterns.
