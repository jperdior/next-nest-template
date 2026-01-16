# Backoffice Frontend - Agent Guidelines

**⚠️ CRITICAL**: Read [TESTING.md](./TESTING.md) before implementing features. Tests are NOT optional!

## Quick Links

- 📖 **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for Clean Architecture patterns
- 📖 **Testing**: See [TESTING.md](./TESTING.md) for testing guide
- 📖 **Root Docs**: See [../../AGENTS.md](../../AGENTS.md)

## Commands

From this directory:

```bash
pnpm dev                # Development server
pnpm build              # Production build
pnpm test               # Run tests
pnpm test:watch         # Watch mode
pnpm lint               # Lint code
pnpm lint:fix           # Auto-fix

# From project root
make shell-backoffice-fe  # Open shell in container
```

## Key Principles

- **Server Components** by default
- **'use client'** only when needed (hooks, events, state)
- **Clean Architecture** - Domain, Application, Infrastructure, Presentation
- **Tailwind CSS** for styling
- **Write tests** alongside code

## Adding a New Feature

1. Create feature folder: `src/features/[feature]/`
2. **Domain**: Types and Zod schemas
3. **Infrastructure**: API client (uses generated types from OpenAPI)
4. **Application**: Custom hooks
5. **Presentation**: UI components
6. **Tests**: Component and hook tests

See [ARCHITECTURE.md](./ARCHITECTURE.md) for patterns.

## API Integration

```typescript
// Use generated types from OpenAPI spec
import type { CreateUserRequest, UserResponse } from '@/shared/types/api-types';

export class UsersApiClient {
  async createUser(input: CreateUserRequest): Promise<UserResponse> {
    return apiClient<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}
```

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Frontend architecture
- [TESTING.md](./TESTING.md) - Testing patterns
- [../../README.md](../../README.md) - Project overview
