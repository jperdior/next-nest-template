# Example Bounded Context

A reference implementation demonstrating DDD patterns in this project.

## Purpose

This context serves as a **template and reference** for creating new bounded contexts. It demonstrates:
- Domain entities and value objects
- Use case patterns
- Repository implementations
- Database schema organization
- NestJS module exports

## Domain

**Subdomain**: Item Management

**Entities**:
- `Item` - A simple business entity with name and description

**Value Objects**:
- `ItemName` - Enforces naming rules

## Use Cases

| Use Case | Description |
|----------|-------------|
| `CreateItem` | Create a new item |
| `GetItems` | Retrieve all items |
| `GetItemById` | Retrieve a specific item |
| `UpdateItem` | Update an existing item |
| `DeleteItem` | Delete an item |

## Database Schema

**Table**: `items`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Item name |
| `description` | String? | Optional description |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

## Usage

### Import Context Module

```typescript
import { ExampleContextModule } from '@shared/contexts/example/example.module';

@Module({
  imports: [ExampleContextModule],
})
export class AppModule {}
```

### Use in Controller

```typescript
import { CreateItemService } from '@shared/contexts/example/application/create-item/create-item.service';

@Controller('items')
export class ItemsController {
  constructor(private createItem: CreateItemService) {}

  @Post()
  async create(@Body() dto) {
    return this.createItem.execute(dto);
  }
}
```

## Files Structure

```
example/
├── domain/
│   ├── entities/
│   │   └── item.entity.ts
│   ├── value-objects/
│   │   └── item-name.value-object.ts
│   └── repositories/
│       └── item.repository.interface.ts
├── application/
│   ├── create-item/
│   └── get-items/
├── infrastructure/
│   ├── database/
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   └── persistence/
│       └── item-prisma.repository.ts
└── example.module.ts
```

## Development

```bash
# Create migration
make db-migrate-create context=example name=my_migration

# Apply migration
make db-migrate-context context=example

# Open Prisma Studio
make db-studio context=example
```

## Testing

See tests in:
- Unit: `modules/*/backend/test/unit/context/example/`
- Integration: `modules/*/backend/test/integration/context/example/`

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
- [../../CREATING_CONTEXTS.md](../../CREATING_CONTEXTS.md) - Create new contexts
- [../../../DDD_GUIDE.md](../../../DDD_GUIDE.md) - DDD patterns
