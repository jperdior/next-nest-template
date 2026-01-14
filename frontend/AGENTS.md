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

# API Code Generation (from project root)
make codegen            # Generate shared types from OpenAPI spec
make spec-validate      # Validate OpenAPI specification
```

## Spec-Driven Development

The frontend uses **shared types generated from the OpenAPI specification**. This ensures type safety and consistency with the backend API.

### Workflow for New API Integration

1. **Wait for Backend Spec Update**: Backend team updates `specs/openapi.yaml`

2. **Generate Types**: Run `make codegen` from project root
   - Generates types in `packages/api-types/`
   - Automatically available to frontend

3. **Implement API Client**:

   ```typescript
   import type { CreateItemRequest, ItemResponse } from '@/shared/types/api-types';
   
   async createItem(input: CreateItemRequest): Promise<ItemResponse> {
     return apiClient<ItemResponse>('/items', {
       method: 'POST',
       body: JSON.stringify(input),
     });
   }
   ```


4. **Use in Components**: Import types, not manual definitions

5. **Test**: Use MSW with generated types

### Key Points

- **Never manually define API types** — always use generated types from `@testproject/api-types`
- **Domain types** (entities, value objects) can still use Zod schemas
- **API request/response types** must come from OpenAPI spec

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
