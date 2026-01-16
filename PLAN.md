# PLAN.md - Planning Guide for AI Agents

> Guidance for AI agents operating in plan mode to create structured, actionable plans.
> This file defines how to classify work and structure plans appropriately.

## Purpose

This guide helps AI agents distinguish between:
- **Epics**: Large features requiring decomposition into multiple tasks
- **Tasks**: Focused work items that can be executed in a single session

Plans must respect the project's architectural principles and **Spec-Driven Development** workflow.

---

## Classification Rules

### When to Classify as an Epic

An epic is a large feature that requires multiple, independent work sessions. Indicators:

- **Scope**: Touches 3+ files across multiple directories or modules
- **Architecture**: Requires new bounded context, module, or crosses multiple layers
- **Complexity**: Involves both frontend and backend, or multiple bounded contexts
- **Duration**: Estimated to take several hours or multiple work sessions
- **Keywords**: "feature", "system", "workflow", "implement X end-to-end", "add new module/context"

**Examples**:
- "Add user profile management feature"
- "Implement order checkout workflow"
- "Create new inventory bounded context"
- "Build admin dashboard for user management"

### When to Classify as a Task

A task is a focused change that can be completed in a single session. Indicators:

- **Scope**: Single concern or related group of files in one area
- **Architecture**: Localized to one layer or one feature
- **Complexity**: Can be reasoned about and completed without major decomposition
- **Duration**: Estimated to take minutes to ~2 hours
- **Keywords**: "fix", "add endpoint", "update component", "refactor", "add field"

**Examples**:
- "Add validation to email field"
- "Fix login error handling"
- "Add pagination to users list endpoint"
- "Refactor user entity to use value objects"

---

## Spec-Driven Development Workflow

**⚠️ CRITICAL**: This project uses **Spec-Driven Development** for all HTTP endpoints.

### The Workflow

When any feature involves HTTP endpoints, you MUST follow this order:

1. **FIRST**: Update `modules/[module]/specs/openapi.yaml`
   - Define endpoints (paths, methods, parameters)
   - Define request/response schemas
   - Define error responses

2. **THEN**: Run `make codegen`
   - Generates TypeScript types from OpenAPI spec
   - Creates type-safe API clients
   - Updates DTO types for controllers

3. **FINALLY**: Implement code
   - Backend: Controllers use generated types
   - Frontend: API clients use generated types
   - Both sides are type-safe against the spec

### Why This Matters

- **Contract-first**: API design is reviewed before implementation
- **Type safety**: Generated types prevent mismatches
- **Documentation**: OpenAPI spec is always up-to-date
- **Consistency**: Frontend and backend share type definitions

### Planning Implication

Every plan involving HTTP endpoints MUST:
- Include explicit "Spec Changes Required" section
- Order tasks to update specs BEFORE implementation
- Include codegen step between spec and implementation
- Verify generated types before using them

---

## Epic Planning Template

When you detect an epic, decompose it into standalone tasks that a developer can execute independently.

### Structure

```markdown
## Epic: [Descriptive Title]

### Overview
[1-2 sentence summary of what this epic accomplishes and why]

### Affected Areas
- **Bounded contexts**: [list contexts that will be created/modified]
- **Modules**: [list modules affected]
- **Layers**: [domain/application/presentation/infrastructure]
- **Frontend/Backend**: [both, frontend-only, backend-only]

### Architecture Context
- **DDD Alignment**: [how this fits DDD principles]
- **Invariants**: [relevant rules from INVARIANTS.md]
- **Patterns**: [existing patterns to follow]

### Spec Changes Required
[If HTTP endpoints are involved, list ALL spec changes upfront]

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| user-app | /api/items | POST | Create new item |
| user-app | /api/items/:id | GET | Get item by ID |

### Tasks

Tasks are ordered to respect dependencies and spec-driven workflow.
Each task is a standalone unit that can be copied and executed in a separate session.

---

#### Task 1: [Title] - OpenAPI Spec Updates

**Scope**: `modules/[module]/specs/openapi.yaml`

**Description**: Define API contract before implementation. This task creates the type-safe contract that both frontend and backend will implement against.

**Dependencies**: None (always first for HTTP features)

**Spec Changes**:
- Add endpoint: `POST /api/items`
  - Request body: `CreateItemRequest` schema
  - Success response: `201` with `ItemResponse` schema
  - Error responses: `400`, `401`, `500`
- Add schemas:
  - `CreateItemRequest`: { name: string, description?: string }
  - `ItemResponse`: { id: string, name: string, description: string | null, createdAt: string }

**Implementation Steps**:
1. Open `modules/[module]/specs/openapi.yaml`
2. Add endpoint definition under appropriate path
3. Add schema definitions in `components/schemas`
4. Verify OpenAPI spec is valid (no syntax errors)

**Verification**:
- [ ] OpenAPI spec is valid YAML
- [ ] Run `make codegen` successfully
- [ ] Generated types appear in `shared/types/api-types.ts`

---

#### Task 2: [Title] - Domain Implementation

**Scope**: `shared/contexts/[context]/domain/` and `shared/contexts/[context]/application/`

**Description**: Implement domain entities, value objects, and use cases for the core business logic.

**Dependencies**: Task 1 (if codegen types are needed)

**Implementation Details**:
1. **Domain Layer** (`domain/entities/`)
   - Create `item.entity.ts`
   - Implement entity with behavior methods
   - Add validation in constructor
   - Example pattern: `shared/contexts/user/domain/entities/user.entity.ts`

2. **Repository Interface** (`domain/repositories/`)
   - Create `item.repository.interface.ts`
   - Define contract: `findById`, `save`, `delete`
   - Example: `shared/contexts/user/domain/repositories/user.repository.interface.ts`

3. **Use Case** (`application/create-item/`)
   - Create `create-item.service.ts`
   - Inject repository interface
   - Implement business logic
   - Return DTO, not entity
   - Example: `shared/contexts/user/application/register-user/register-user.service.ts`

4. **Repository Implementation** (`infrastructure/persistence/`)
   - Create `item-prisma.repository.ts`
   - Implement repository interface
   - Transform Prisma objects to domain entities
   - Handle null vs undefined properly

5. **Context Module**
   - Export use case in `[context].module.ts`
   - Register repository provider

**Architecture Compliance**:
- Domain entities are pure business logic (no Prisma, no NestJS)
- Use cases depend only on repository interfaces
- Repository implementations in infrastructure layer
- Thin use cases that orchestrate domain entities

**Testing**:
- Unit tests for entity validation
- Integration tests for use cases with mock repository

**Verification**:
- [ ] Entity enforces business rules
- [ ] Use case is framework-agnostic
- [ ] Repository transforms Prisma to domain correctly

---

#### Task 3: [Title] - Backend Controller

**Scope**: `modules/[module]/backend/src/presentation/http/`

**Description**: Create thin HTTP controller that delegates to bounded context use cases.

**Dependencies**: Task 1 (codegen types), Task 2 (use cases)

**Implementation Details**:
1. Create/update controller file: `items.controller.ts`
2. Import generated types from codegen
3. Inject use case from context
4. Implement thin endpoint that:
   - Validates input (use Zod or class-validator with generated schemas)
   - Calls use case
   - Transforms output to response DTO
   - Handles errors appropriately

**Code Pattern**:
```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateItemService } from '@shared/contexts/[context]/application/create-item/create-item.service';
import { CreateItemRequest, ItemResponse } from '@shared/types/api-types';
import { JwtAuthGuard } from '@shared/packages/auth';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly createItem: CreateItemService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateItemRequest): Promise<ItemResponse> {
    const result = await this.createItem.execute({
      name: dto.name,
      description: dto.description,
    });
    
    return {
      id: result.id,
      name: result.name,
      description: result.description ?? null,
      createdAt: result.createdAt.toISOString(),
    };
  }
}
```

**Architecture Compliance**:
- Controller is THIN (no business logic)
- Delegates to context use case
- Uses generated types from OpenAPI spec
- Transforms domain DTOs to API response format

**Testing**:
- Integration test: `modules/[module]/backend/test/integration/items.spec.ts`
- Test HTTP layer end-to-end with test database

**Verification**:
- [ ] Controller uses generated types
- [ ] No business logic in controller
- [ ] Integration tests pass

---

#### Task 4: [Title] - Frontend Implementation

**Scope**: `modules/[module]/frontend/src/features/[feature]/`

**Description**: Implement frontend feature using Clean Architecture pattern.

**Dependencies**: Task 1 (codegen types), Task 3 (backend endpoint)

**Implementation Details**:
[Detailed steps for frontend implementation]

**Verification**:
- [ ] Uses generated API types
- [ ] Component tests pass
- [ ] Integration with backend works
```

### Key Principles for Epic Planning

1. **Standalone Tasks**: Each task should be executable without reading other tasks
2. **Copy-Paste Ready**: Developer should be able to copy a task into a new agent session
3. **Spec-First Order**: Always plan spec updates before implementation
4. **Clear Dependencies**: Explicitly state what must complete before a task can start
5. **Code Patterns**: Reference existing similar code as examples
6. **Verification Steps**: Include concrete checkpoints to verify completion

---

## Task Planning Template

When you detect a focused task, provide detailed technical implementation guidance.

### Structure

```markdown
## Task: [Descriptive Title]

### Overview
[What this task accomplishes and why it's needed]

### Context
- **Related Files**: [list existing files that provide context]
- **Architecture Layer**: [domain/application/presentation/infrastructure]
- **Bounded Context/Module**: [which context or module this affects]

### Spec Changes Required

**One of:**

- [ ] **No HTTP changes** - Skip to implementation
- [ ] **OpenAPI spec update needed**:
  - File: `modules/[module]/specs/openapi.yaml`
  - Endpoints: [list endpoints to add/modify]
  - Schemas: [list schemas to add/modify]
  - After spec changes: Run `make codegen`

### Technical Implementation

#### Files to Modify (in order)

| Order | File | Change Description |
|-------|------|-------------------|
| 1 | `modules/[module]/specs/openapi.yaml` | Add POST /api/items endpoint |
| 2 | (codegen) | Run `make codegen` to generate types |
| 3 | `shared/contexts/[context]/domain/entities/item.entity.ts` | Create Item entity |
| 4 | `shared/contexts/[context]/application/create-item/create-item.service.ts` | Create use case |
| 5 | `modules/[module]/backend/src/presentation/http/items.controller.ts` | Add endpoint |

#### Implementation Steps

Provide step-by-step technical details:

1. **[Step Description]**
   ```typescript
   // Code pattern or example
   ```
   - Explanation of approach
   - Key decisions

2. **[Next Step]**
   - Specific changes to make
   - Integration points

3. **[Final Step]**
   - Testing approach
   - Verification method

#### Architecture Compliance

- **DDD Layer**: [which layer and why]
- **Existing Patterns**: [reference similar implementations]
  - Example: See `shared/contexts/user/application/register-user/` for similar pattern
- **Invariants**: [relevant rules from INVARIANTS.md to respect]
  - No business logic in controllers
  - Domain entities are framework-agnostic
  - Use repository interfaces, not Prisma directly
- **Spec-Driven**: [confirm spec updated before code if HTTP involved]

#### Code Patterns to Follow

```typescript
// Include relevant code examples from existing codebase
// Show the pattern this task should follow
```

### Testing Approach

**Test Type**: [unit/integration/e2e]

**Files to Create/Modify**:
- [ ] `path/to/test.spec.ts` - [what to test]

**Test Cases**:
1. [Scenario]: [expected behavior]
2. [Error case]: [expected error handling]
3. [Edge case]: [expected behavior]

### Verification Checklist

- [ ] OpenAPI spec valid (if HTTP involved)
- [ ] `make codegen` runs without errors (if HTTP involved)
- [ ] Implementation matches spec contract (if HTTP involved)
- [ ] No linter errors
- [ ] Tests pass
- [ ] Architecture layers respected
- [ ] No business logic in presentation layer
```

### Key Principles for Task Planning

1. **Technical Depth**: Include specific code patterns and file paths
2. **Ordered Steps**: Clear sequence with dependencies
3. **Architecture Awareness**: Reference DDD layers and invariants
4. **Spec-First**: Always check if OpenAPI changes are needed
5. **Verification**: Concrete steps to confirm completion
6. **Examples**: Reference similar existing code

---

## Architecture Integration

Every plan (epic or task) must consider:

### Document References

- **INVARIANTS.md**: Check for violated constraints
  - DDD separation (contexts vs modules)
  - No business logic in controllers/components
  - Spec-driven development for HTTP
  
- **DDD_GUIDE.md**: Verify layer placement
  - Domain logic → `shared/contexts/[context]/domain/`
  - Use cases → `shared/contexts/[context]/application/`
  - Controllers → `modules/[module]/backend/src/presentation/http/`
  - Frontend features → `modules/[module]/frontend/src/features/`

- **AGENTS.md**: Reference commands
  - `make codegen` after OpenAPI changes
  - `make db-migrate-create name=X` for database changes
  - `make test` to verify changes

### Common Patterns to Reference

When planning, point to existing examples:

- **Domain Entity**: `shared/contexts/user/domain/entities/user.entity.ts`
- **Value Object**: `shared/contexts/user/domain/value-objects/email.value-object.ts`
- **Use Case**: `shared/contexts/user/application/register-user/register-user.service.ts`
- **Repository Interface**: `shared/contexts/user/domain/repositories/user.repository.interface.ts`
- **Repository Implementation**: `shared/contexts/user/infrastructure/persistence/user-prisma.repository.ts`
- **Thin Controller**: `modules/user-app/backend/src/presentation/http/auth.controller.ts`
- **Frontend Feature**: `modules/user-app/frontend/src/features/auth/`

### Spec-Driven Workflow Integration

For any HTTP-related plan:

1. **Always check first**: Does this involve HTTP endpoints?
2. **If yes**: Plan spec changes in separate task (or first step)
3. **Order matters**: Spec → Codegen → Implementation
4. **Verification**: Include codegen success in acceptance criteria
5. **Type usage**: Verify implementation uses generated types

---

## Planning Checklist

Use this checklist when creating plans:

### Classification
- [ ] Determined if epic or task based on scope/complexity
- [ ] Considered dependencies and ordering

### Spec-Driven Development
- [ ] Identified if HTTP endpoints are involved
- [ ] Planned OpenAPI spec changes FIRST
- [ ] Included codegen step between spec and implementation
- [ ] Verified generated types will be used

### Architecture Alignment
- [ ] Verified DDD layer placement (domain vs application vs presentation)
- [ ] Ensured controllers/components stay thin
- [ ] Placed business logic in bounded contexts, not modules
- [ ] Referenced existing patterns as examples

### Documentation References
- [ ] Checked INVARIANTS.md for constraints
- [ ] Referenced DDD_GUIDE.md for patterns
- [ ] Included relevant commands from AGENTS.md

### Quality
- [ ] Included testing approach
- [ ] Added verification checklist
- [ ] Made tasks standalone (for epics)
- [ ] Provided technical depth (file paths, code patterns)

---

## Examples

### Example 1: Epic Detection and Planning

**Request**: "Add item management feature with CRUD operations"

**Classification**: EPIC
- Spans multiple layers (domain, application, presentation)
- Involves OpenAPI spec, backend, and potentially frontend
- Multiple related but independent tasks

**Plan Structure**:
1. Task 1: OpenAPI spec for all CRUD endpoints
2. Task 2: Domain entities and use cases
3. Task 3: Backend controllers
4. Task 4: Frontend components (if needed)

### Example 2: Task Detection and Planning

**Request**: "Add description field to user entity"

**Classification**: TASK
- Focused change in one area
- Single layer (domain + database)
- Can be completed in one session

**Plan Structure**:
- Check if HTTP endpoints need updating (yes, if exposed in API)
- Update OpenAPI spec first (add field to schema)
- Run codegen
- Add field to domain entity
- Create database migration
- Update repository transformations

---

## Summary

**Remember**:
- **Epics** = Decompose into standalone tasks
- **Tasks** = Detailed technical implementation
- **Spec-First** = Always plan OpenAPI before HTTP implementation
- **DDD Aware** = Respect layers and bounded contexts
- **Verification** = Include concrete completion criteria

Your goal: Create plans that developers can execute confidently without constant back-and-forth clarification.
