# API Specifications

This directory contains the OpenAPI specifications for the project's HTTP APIs.

## Overview

The OpenAPI specification in this directory is the **single source of truth** for all HTTP API contracts. Both backend and frontend code generation is derived from these specs.

## Files

- `openapi.yaml` - Main OpenAPI 3.0.3 specification

## Workflow

### 1. Update the Specification

Edit `openapi.yaml` to add or modify API endpoints:

```yaml
paths:
  /items:
    post:
      summary: Create a new item
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

### 2. Validate the Specification

```bash
make spec-validate
```

### 3. Generate TypeScript Types

```bash
make codegen
```

This generates:
- Shared TypeScript types in `packages/api-types/src/generated.ts`
- Types are automatically available to both backend and frontend

### 4. Implement Backend & Frontend

Use the generated types:

**Backend:**

```typescript
import type { CreateItemRequest, ItemResponse } from '@/shared/types/api-types';
```

**Frontend:**

```typescript
import type { CreateItemRequest, ItemResponse } from '@/shared/types/api-types';
```

## Best Practices

1. **Always update spec first** before implementing code
2. **Run `make codegen`** after any spec changes
3. **Use semantic versioning** in `info.version`
4. **Document all fields** with descriptions and examples
5. **Define reusable schemas** in `components/schemas`
6. **Use proper HTTP status codes** in responses
7. **Validate spec** before committing changes

## Schema Guidelines

### Request Schemas

- Use clear, descriptive names (e.g., `CreateItemRequest`, `UpdateUserRequest`)
- Mark required fields explicitly
- Include examples for all fields
- Add validation constraints (minLength, maxLength, pattern, etc.)

### Response Schemas

- Use consistent naming (e.g., `ItemResponse`, `UserListResponse`)
- Include all fields that will be returned
- Document nullable/optional fields
- Use proper format specifiers (date-time, uuid, etc.)

### Error Responses

All endpoints should include standard error responses:

```yaml
responses:
  '400':
    description: Invalid input
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
  '500':
    description: Internal server error
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

## Tools

- **Code Generation**: `openapi-typescript` (used by `make codegen`)
- **Validation**: `make spec-validate` attempts to parse the spec with `openapi-typescript` (parsing errors indicate invalid spec)
- **Documentation**: Swagger UI at `http://localhost:3001/api/docs`

**Note**: The current `spec-validate` implementation uses `openapi-typescript` parsing as a validation proxy. For stricter validation, consider adding a dedicated validator like `@redocly/cli` or `@apidevtools/swagger-cli`.

## Resources

- [OpenAPI 3.0.3 Specification](https://spec.openapis.org/oas/v3.0.3)
- [OpenAPI Best Practices](https://oai.github.io/Documentation/best-practices.html)
- [openapi-typescript Documentation](https://github.com/drwpow/openapi-typescript)
