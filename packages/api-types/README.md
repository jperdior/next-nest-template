# @testproject/api-types

Shared TypeScript types generated from the OpenAPI specification.

## Overview

This package contains TypeScript types automatically generated from `specs/openapi.yaml`. These types are used by both the backend and frontend to ensure type safety and consistency across the API boundary.

## Usage

### In Backend

```typescript
import type { components } from '@testproject/api-types';

type ItemResponse = components['schemas']['ItemResponse'];
type CreateItemRequest = components['schemas']['CreateItemRequest'];
```

### In Frontend

```typescript
import type { components, paths } from '@testproject/api-types';

type ItemResponse = components['schemas']['ItemResponse'];
type GetItemsResponse = paths['/items']['get']['responses']['200']['content']['application/json'];
```

## Generation

Types are generated automatically when running:

```bash
make codegen
```

This command:
1. Reads `specs/openapi.yaml`
2. Generates TypeScript types in `src/generated.ts`
3. Builds the package

## Do Not Edit

**Do not manually edit `src/generated.ts`** - it is automatically generated and will be overwritten. If you need to change types, update the OpenAPI spec in `specs/openapi.yaml` and re-run `make codegen`.
