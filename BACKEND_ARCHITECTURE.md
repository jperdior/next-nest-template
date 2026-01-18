# Backend Architecture

Patterns and guidelines for backend applications in this monorepo.

## Overview

Backend apps (`apps/*/backend/`) are **thin HTTP layers** that delegate to bounded contexts (`src/`). They contain no domain logic.

```
┌─────────────────────────────────────────────────────────────────┐
│                    apps/[app]/backend/                           │
│                    (Thin HTTP Layer)                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Controllers (presentation/http/)                         │ │
│  │   - Request handling                                       │ │
│  │   - DTO validation                                         │ │
│  │   - Delegates to context use cases                         │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└───────────────────────┼─────────────────────────────────────────┘
                        │ imports
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    src/[context]/                                │
│                    (Bounded Contexts)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Use Cases (application/)                                 │ │
│  │   Domain Entities (domain/)                                │ │
│  │   Repositories (infrastructure/)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

### App Backend (Thin Layer)

```
apps/[app]/backend/
├── src/
│   ├── presentation/
│   │   └── http/
│   │       ├── auth.controller.ts      # Thin controller
│   │       ├── auth.module.ts
│   │       └── dto/
│   │           ├── login.dto.ts
│   │           └── register.dto.ts
│   ├── shared/
│   │   └── types/
│   │       └── api-types.ts            # Generated from OpenAPI
│   ├── app.module.ts                   # Imports context modules
│   └── main.ts
└── test/
    └── integration/                    # HTTP endpoint tests
```

### Bounded Context (Domain Logic)

Domain logic lives in `src/[context]/`, NOT in apps:

```
src/[context]/
└── [aggregate]/
    ├── domain/
    │   ├── entities/
    │   │   └── user.entity.ts
    │   ├── value-objects/
    │   │   └── email.value-object.ts
    │   └── user.repository.ts          # Interface (port)
    ├── application/
    │   ├── register-user/
    │   │   ├── register-user.input.ts
    │   │   ├── register-user.output.ts
    │   │   └── register-user.service.ts
    │   └── login-user/
    │       └── login-user.service.ts
    ├── infrastructure/
    │   └── persistence/
    │       └── user-prisma.repository.ts
    └── user.module.ts                  # NestJS module
```

## Key Pattern: Thin Controllers

Controllers handle HTTP concerns only and delegate to context use cases.

### Example Controller

```typescript
// apps/user-app/backend/src/presentation/http/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { 
  RegisterUserService, 
  LoginUserService 
} from '@testproject/user-facing-app-context';  // From bounded context
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserService,
    private readonly loginUser: LoginUserService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUser.execute({
      email: dto.email,
      name: dto.name,
      password: dto.password,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUser.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
```

### Example App Module

```typescript
// apps/user-app/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserFacingAppUserModule } from '@testproject/user-facing-app-context';
import { AuthModule } from './presentation/http/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserFacingAppUserModule,  // Import bounded context
    AuthModule,               // Import presentation module
  ],
})
export class AppModule {}
```

## Adding a New Endpoint

Follow the **Spec-Driven Development** workflow:

### 1. Update OpenAPI Spec First

```yaml
# apps/[app]/specs/openapi.yaml
paths:
  /items:
    post:
      summary: Create item
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateItemRequest'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ItemResponse'
```

### 2. Generate Types

```bash
make codegen
```

### 3. Implement Use Case in Bounded Context

If the domain logic doesn't exist yet, add it to `src/[context]/`:

```typescript
// src/[context]/[aggregate]/application/create-item/create-item.service.ts
@Injectable()
export class CreateItemService {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: ItemRepositoryInterface,
  ) {}

  async execute(input: CreateItemInput): Promise<CreateItemOutput> {
    const item = new ItemEntity({ ...input });
    return this.itemRepository.save(item);
  }
}
```

### 4. Create Thin Controller

```typescript
// apps/[app]/backend/src/presentation/http/items.controller.ts
@Controller('items')
export class ItemsController {
  constructor(private readonly createItem: CreateItemService) {}

  @Post()
  async create(@Body() dto: CreateItemDto) {
    return this.createItem.execute(dto);
  }
}
```

### 5. Add Integration Tests

```typescript
// apps/[app]/backend/test/integration/items.spec.ts
describe('ItemsController', () => {
  it('POST /items creates item', async () => {
    const response = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Test' })
      .expect(201);

    expect(response.body.name).toBe('Test');
  });
});
```

## DTO Patterns

### Request DTOs (class-validator)

```typescript
// apps/[app]/backend/src/presentation/http/dto/create-item.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Response DTOs

Use generated types from OpenAPI when possible, or create simple response classes.

## Testing

See [TESTING.md](apps/user-app/backend/TESTING.md) for detailed testing patterns.

### Quick Reference

```bash
# Run tests
make test-user-app
make test-backoffice

# From inside container
pnpm test
pnpm test:watch
pnpm test:cov
```

### Test Structure

- **Integration tests**: Test HTTP endpoints end-to-end
- **Location**: `test/integration/`
- **Pattern**: AAA (Arrange-Act-Assert)

## Best Practices

### DO

- Keep controllers thin (< 20 lines per method)
- Delegate all logic to bounded context use cases
- Use DTOs for request validation
- Import context modules, not individual services directly
- Write integration tests for all endpoints

### DON'T

- Put business logic in controllers
- Create entities or repositories in apps
- Access Prisma directly from apps
- Duplicate domain logic across apps

## Database

Database schema is at `src/shared/infrastructure/persistence/prisma/schema.prisma`.

Apps access it through bounded context repositories, never directly.

```bash
# Database commands
make db-migrate-create name=add_field
make db-migrate-deploy
make db-studio
```

## Related Documentation

- [DDD_GUIDE.md](./DDD_GUIDE.md) - Bounded contexts architecture
- [INVARIANTS.md](./INVARIANTS.md) - Architectural rules
- [AGENTS.md](./AGENTS.md) - Commands reference
