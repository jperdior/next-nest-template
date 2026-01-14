# Frontend Architecture

Clean Architecture pattern with Next.js 14+ App Router.

## Structure

```
features/
└── [feature]/
    ├── domain/              # Types, entities, validation
    ├── application/         # Use cases (hooks)
    ├── infrastructure/      # API clients
    └── presentation/        # UI components
```

## Layers

- **Domain**: Zod schemas, type definitions (no React)
- **Application**: Custom hooks for business logic
- **Infrastructure**: API clients, storage adapters
- **Presentation**: React components (Server/Client)

## Dependency Rule

Dependencies flow inward: Presentation → Application → Domain

Components use hooks, hooks use API clients, everything depends on domain types.
