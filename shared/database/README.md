# ⚠️ DEPRECATED

This package is deprecated in favor of `@testproject/database` located at:
`shared/contexts/Infrastructure/persistence/`

**New location**: All database models are now in a single shared Prisma schema at `shared/contexts/Infrastructure/persistence/prisma/schema.prisma`

**Why the change?**
- Prisma requires a single schema for cross-context FK relationships
- Simplified migration management
- Better support for bounded context relationships
- Domain layers remain independent (only reference IDs)

**Migration guide:**
- Import from `@testproject/database` instead of `@testproject/database` (this package)
- Models are organized by context using comment headers
- See `shared/contexts/Infrastructure/persistence/README.md` for details

This package will be removed in a future version.
