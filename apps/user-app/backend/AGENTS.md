# User App Backend - Agent Guidelines

## Quick Links

- **Architecture**: See [BACKEND_ARCHITECTURE.md](../../../BACKEND_ARCHITECTURE.md)
- **DDD Guide**: See [DDD_GUIDE.md](../../../DDD_GUIDE.md)
- **Testing**: See [TESTING.md](./TESTING.md)

## Commands

From this directory (`apps/user-app/backend/`):

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
make start-user-app       # Start this app
make test-user-app        # Run tests
make shell-user-app-be    # Open shell in container
make logs-user-app        # View logs
```

## Access URLs

- **Backend API**: http://api.user.local:8080 (via Traefik)
- **Frontend**: http://user.local:8080 (via Traefik)
- **Direct access**: http://localhost:3001 (not recommended)

**Required in `/etc/hosts`:**
```
127.0.0.1 user.local api.user.local
```

## Key Reminder

**Apps are THIN** - domain logic lives in `src/` bounded contexts.

Controllers delegate to context use cases:

```typescript
// This app imports from the user-facing-app bounded context
import { RegisterUserService } from '@testproject/user-facing-app-context';

@Controller('auth')
export class AuthController {
  constructor(private registerUser: RegisterUserService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUser.execute(dto);  // Delegate!
  }
}
```

## Adding a New Endpoint

1. Update `../../specs/openapi.yaml`
2. Run `make codegen` from project root
3. Create thin controller in `src/presentation/http/`
4. Controller delegates to bounded context use cases
5. Add integration tests
