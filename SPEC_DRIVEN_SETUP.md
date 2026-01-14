# Spec-Driven Development Setup - Complete

This document summarizes the spec-driven development implementation.

## ✅ What Was Implemented

### 1. OpenAPI Specification
- Created `specs/openapi.yaml` with current API structure
- Documented Items API (GET /items, POST /items)
- Defined all request/response schemas

### 2. Shared Types Package
- Created `packages/api-types/` workspace package
- Configured TypeScript compilation
- Set up automatic re-exports via `src/index.ts`
- Generated types will be in `src/generated.ts` (created by `make codegen`)

### 3. Code Generation Tooling
- Added `openapi-typescript` dependency to root package
- Created `make codegen` command to generate types
- Created `make spec-validate` command to validate spec
- Updated `pnpm-workspace.yaml` to include packages

### 4. Backend Integration
- Added `@testproject/api-types` dependency to backend
- Created `backend/src/shared/types/api-types.ts` for convenient imports
- Types ready to use in controllers and DTOs

### 5. Frontend Integration
- Added `@testproject/api-types` dependency to frontend
- Created `frontend/src/shared/types/api-types.ts` for convenient imports
- Types ready to use in API clients and components

### 6. Documentation Updates
- **AGENTS.md**: Added spec-driven workflow section
- **CLAUDE.md**: Added HTTP API implementation workflow
- **backend/AGENTS.md**: Added spec-driven development guide
- **frontend/AGENTS.md**: Added API integration workflow
- **specs/README.md**: Comprehensive guide for working with OpenAPI specs

## 🚀 How to Use

### First Time Setup

1. **Start Docker Containers**:
   ```bash
   make start
   ```

2. **Generate Initial Types**:
   ```bash
   make codegen
   ```

   This will:
   - Read `specs/openapi.yaml`
   - Generate TypeScript types in `packages/api-types/src/generated.ts` (inside Docker container)
   - Build the api-types package (inside Docker container)

   **Note**: Code generation runs inside the backend container to ensure consistent tooling across all environments.

### Adding a New HTTP Endpoint

**Step 1: Update OpenAPI Spec**

Edit `specs/openapi.yaml`:

```yaml
paths:
  /users:
    post:
      tags:
        - users
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'

components:
  schemas:
    CreateUserRequest:
      type: object
      required:
        - email
        - name
      properties:
        email:
          type: string
          format: email
        name:
          type: string

    UserResponse:
      type: object
      required:
        - id
        - email
        - name
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        name:
          type: string
```

**Step 2: Generate Types**

```bash
make codegen
```

**Step 3: Use in Backend**

```typescript
// backend/src/shared/types/api-types.ts (add these lines)
export type CreateUserRequest = components['schemas']['CreateUserRequest'];
export type UserResponse = components['schemas']['UserResponse'];

// backend/src/context/users/presentation/http/users.controller.ts
import type { CreateUserRequest, UserResponse } from '@/shared/types/api-types';

@Post()
async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
  // TypeScript ensures this matches the spec
  const result = await this.createUserService.execute(dto);
  return {
    id: result.id,
    email: result.email,
    name: result.name,
  };
}
```

**Step 4: Use in Frontend**

```typescript
// frontend/src/shared/types/api-types.ts (add these lines)
export type CreateUserRequest = components['schemas']['CreateUserRequest'];
export type UserResponse = components['schemas']['UserResponse'];

// frontend/src/features/users/infrastructure/api/users-api.client.ts
import type { CreateUserRequest, UserResponse } from '@/shared/types/api-types';
import { apiClient } from '@/shared/lib/api-client';

export class UsersApiClient {
  async createUser(input: CreateUserRequest): Promise<UserResponse> {
    return apiClient<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}
```

### Adding a CLI Command

CLI commands **don't need OpenAPI specs**. They reuse the same use cases:

```typescript
// backend/src/context/users/presentation/command/create-user.command.ts
import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'user:create' })
export class CreateUserCommand extends CommandRunner {
  private readonly logger = new Logger(CreateUserCommand.name);

  constructor(private readonly createUserService: CreateUserService) {
    super();
  }

  async run(args: string[], options: { email: string; name: string }): Promise<void> {
    // Reuses the same use case as the HTTP controller
    const result = await this.createUserService.execute({
      email: options.email,
      name: options.name,
    });
    this.logger.log(`Created user: ${result.id}`);
  }
}
```

## 📁 Directory Structure

```text
├── specs/
│   ├── openapi.yaml           # OpenAPI specification (SOURCE OF TRUTH)
│   └── README.md              # Guide for working with specs
├── packages/
│   └── api-types/
│       ├── src/
│       │   ├── generated.ts   # Generated types (DO NOT EDIT)
│       │   └── index.ts       # Re-exports
│       ├── package.json
│       └── tsconfig.json
├── backend/
│   └── src/
│       └── shared/
│           └── types/
│               └── api-types.ts  # Convenient re-exports for backend
├── frontend/
│   └── src/
│       └── shared/
│           └── types/
│               └── api-types.ts  # Convenient re-exports for frontend
└── Makefile                   # make codegen, make spec-validate
```

## 🎯 Agent Workflow (AI Assistant Behavior)

When you (as an AI agent) receive a request to add a new HTTP API feature:

1. ✅ **Update `specs/openapi.yaml` first**
2. ✅ **Run `make codegen`**
3. ✅ **Implement backend using generated types**
4. ✅ **Implement frontend using generated types**
5. ✅ **Add tests**

When you receive a request to add a CLI command:

1. ✅ **Implement CLI command in `presentation/command/`**
2. ✅ **Reuse existing use cases from `application/`**
3. ❌ **No spec needed, no codegen needed**

## 🔍 Key Commands

| Command | Description |
|---------|-------------|
| `make codegen` | Generate shared types from OpenAPI spec |
| `make spec-validate` | Validate OpenAPI specification |
| `make start` | Start all services (Docker) |
| `make test` | Run all tests |

## 📚 Benefits

### Before (Code-First)
- ❌ Types defined separately in backend and frontend
- ❌ Type drift between frontend and backend
- ❌ Runtime errors from mismatched contracts
- ❌ Manual synchronization required

### After (Spec-Driven)
- ✅ Single source of truth (OpenAPI spec)
- ✅ Shared types between frontend and backend
- ✅ Type errors caught at compile time
- ✅ Automatic synchronization via `make codegen`
- ✅ Living documentation (Swagger UI)

## 🎓 Learning Resources

- **OpenAPI Spec Guide**: `specs/README.md`
- **Agent Workflows**: `AGENTS.md` (section "API Specification & Code Generation")
- **Backend Guide**: `backend/AGENTS.md` (section "Spec-Driven Development")
- **Frontend Guide**: `frontend/AGENTS.md` (section "Spec-Driven Development")
- **AI Behavior**: `CLAUDE.md` (section "Implementing a New HTTP API Endpoint")

## ⚠️ Important Notes

1. **Always run `make codegen` after updating the spec** - Types won't update automatically
2. **Never manually edit `packages/api-types/src/generated.ts`** - It's regenerated each time
3. **Domain/Application layers still use Zod** - Generated types are for API boundaries only
4. **CLI commands don't need specs** - They share use cases with HTTP controllers

## 🎉 You're Ready!

The spec-driven development setup is complete. Start by updating `specs/openapi.yaml` for your next feature!
