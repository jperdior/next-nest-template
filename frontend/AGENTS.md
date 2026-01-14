# Frontend - Agent Guidelines

## Commands

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm test         # Run tests
pnpm test:watch   # Watch mode
pnpm lint         # Lint code
```

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
