# Backoffice Backend - Agent Guidelines

## Quick Links

- **Architecture**: See [BACKEND_ARCHITECTURE.md](../../../BACKEND_ARCHITECTURE.md)
- **DDD Guide**: See [DDD_GUIDE.md](../../../DDD_GUIDE.md)
- **Testing**: See [../../user-app/backend/TESTING.md](../../user-app/backend/TESTING.md)

## Commands

From this directory (`apps/backoffice/backend/`):

```bash
pnpm dev                # Development mode (watch)
pnpm build              # Production build
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:cov           # With coverage
pnpm lint               # Lint code
pnpm lint:fix           # Auto-fix
```

From project root:

```bash
make start-backoffice       # Start this app
make test-backoffice        # Run tests
make shell-backoffice-be    # Open shell in container
make logs-backoffice        # View logs
```

## Access URLs

- **Backend API**: http://api.admin.local:8080 (via Traefik)
- **Frontend**: http://admin.local:8080 (via Traefik)
- **Direct access**: http://localhost:3011 (not recommended)

**Required in `/etc/hosts`:**
```
127.0.0.1 admin.local api.admin.local
```

## Key Reminder

**Apps are THIN** - domain logic lives in `src/` bounded contexts.

Controllers delegate to context use cases:

```typescript
// This app imports from the backoffice bounded context
import { ListUsersService } from '@testproject/backoffice-context';

@Controller('users')
export class UsersController {
  constructor(private listUsers: ListUsersService) {}

  @Get()
  async list() {
    return this.listUsers.execute();  // Delegate!
  }
}
```

## Adding a New Endpoint

1. Update `../../specs/openapi.yaml`
2. Run `make codegen` from project root
3. Create thin controller in `src/presentation/http/`
4. Controller delegates to bounded context use cases
5. Add integration tests
