# User App Backend - Agent Guidelines

**⚠️ CRITICAL**: Read [TESTING.md](./TESTING.md) before implementing features. Tests are NOT optional!

## Quick Links

- 📖 **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for DDD patterns
- 📖 **Testing**: See [TESTING.md](./TESTING.md) for testing guide
- 📖 **Root Docs**: See [../../AGENTS.md](../../AGENTS.md) and [../../DDD_GUIDE.md](../../DDD_GUIDE.md)

## Module Commands

From this directory (`modules/user-app/backend/`):

```bash
pnpm dev                # Development mode (watch)
pnpm build              # Production build
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:cov           # With coverage
pnpm lint               # Lint code
pnpm lint:fix           # Auto-fix

# From project root
make shell-user-app-be  # Open shell in container
make test-user-app      # Run tests
```

## Key Principles

- **Modules are THIN** - Controllers delegate to bounded contexts
- **Domain logic** goes in `shared/contexts/`, not here
- **App-specific logic** - Registration flows, notifications, analytics
- **Write tests** alongside code (see TESTING.md)

## Adding a New Endpoint

1. Update `../../specs/openapi.yaml`
2. Run `make codegen` from project root
3. Create thin controller in `src/presentation/http/`
4. Controller delegates to bounded context use cases
5. Add integration tests

See [ARCHITECTURE.md](./ARCHITECTURE.md) for patterns.

## Common Patterns

### Thin Controller

```typescript
@Controller('users')
export class UsersController {
  constructor(private registerUser: RegisterUserService) {} // From context
  
  @Post()
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto); // Delegate!
  }
}
```

### App-Specific Service

```typescript
@Injectable()
export class RegisterUserService {
  constructor(
    private createUser: CreateUserService, // Domain use case
    private sendEmail: EmailService        // App-specific
  ) {}
  
  async execute(input) {
    const user = await this.createUser.execute(input);
    await this.sendEmail.sendWelcomeEmail(user);
    return user;
  }
}
```

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Module architecture
- [TESTING.md](./TESTING.md) - Testing patterns
- [../../DDD_GUIDE.md](../../DDD_GUIDE.md) - Full DDD reference
