# Frontend Architecture

Patterns and guidelines for frontend applications in this monorepo.

## Overview

Frontend apps use **Clean Architecture** with feature-based organization and Next.js 14+ App Router.

```
┌─────────────────────────────────────────────────────────────────┐
│                    apps/[app]/frontend/                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │   src/app/              (Next.js App Router)                │ │
│  │   └── page.tsx          Server/Client Components            │ │
│  └──────────────────────────────┬──────────────────────────────┘ │
│                                 │ uses                            │
│  ┌──────────────────────────────▼──────────────────────────────┐ │
│  │   src/features/[feature]/                                   │ │
│  │   ├── presentation/     UI Components                       │ │
│  │   ├── application/      Hooks (use cases)                   │ │
│  │   ├── infrastructure/   API clients                         │ │
│  │   └── domain/           Types, validation                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
apps/[app]/frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── features/                   # Feature modules
│   │   └── auth/
│   │       ├── domain/             # Types, Zod schemas
│   │       │   └── types.ts
│   │       ├── application/        # Custom hooks
│   │       │   ├── useLogin.ts
│   │       │   └── useRegister.ts
│   │       ├── infrastructure/     # API client
│   │       │   └── auth-api.ts
│   │       └── presentation/       # UI components
│   │           ├── LoginForm.tsx
│   │           └── RegisterForm.tsx
│   │
│   ├── shared/                     # Shared utilities
│   │   ├── api/
│   │   │   └── client.ts           # Base API client
│   │   └── types/
│   │       └── api-types.ts        # Generated from OpenAPI
│   │
│   └── styles/
│       └── globals.css             # Tailwind imports
│
├── __tests__/
│   ├── mocks/
│   │   ├── handlers.ts             # MSW handlers
│   │   └── server.ts               # MSW server
│   └── unit/
│       └── features/
│           └── auth/
│               ├── LoginForm.spec.tsx
│               └── useLogin.spec.ts
│
└── tailwind.config.ts
```

## Feature Layer Structure

Each feature follows Clean Architecture layers:

### Domain Layer

Types, interfaces, and validation schemas. No React dependencies.

```typescript
// src/features/auth/domain/types.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
```

### Infrastructure Layer

API clients and external service adapters.

```typescript
// src/features/auth/infrastructure/auth-api.ts
import { apiClient } from '@/shared/api/client';
import type { LoginInput, AuthResponse } from '../domain/types';

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
```

### Application Layer

Custom hooks that orchestrate business logic.

```typescript
// src/features/auth/application/useLogin.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../infrastructure/auth-api';
import type { LoginInput } from '../domain/types';

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(input);
      localStorage.setItem('accessToken', response.accessToken);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
```

### Presentation Layer

React components for UI.

```typescript
// src/features/auth/presentation/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useLogin } from '../application/useLogin';
import { LoginSchema } from '../domain/types';

export function LoginForm() {
  const { login, isLoading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      // Handle validation errors
      return;
    }
    
    await login(result.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

## Server vs Client Components

### Default: Server Components

Pages and layouts are Server Components by default:

```typescript
// src/app/page.tsx (Server Component)
export default function HomePage() {
  return (
    <main>
      <h1>Welcome</h1>
      <LoginForm />  {/* Client Component */}
    </main>
  );
}
```

### Use 'use client' When Needed

Add `'use client'` directive for:
- Hooks (useState, useEffect, custom hooks)
- Event handlers (onClick, onSubmit)
- Browser APIs (localStorage, window)

```typescript
// src/features/auth/presentation/LoginForm.tsx
'use client';  // Required for useState, event handlers

import { useState } from 'react';
// ...
```

## Adding a New Feature

### 1. Create Feature Folder

```bash
mkdir -p src/features/[feature]/{domain,application,infrastructure,presentation}
```

### 2. Domain Layer First

```typescript
// src/features/items/domain/types.ts
import { z } from 'zod';

export const CreateItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;

export interface Item {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}
```

### 3. Infrastructure (API Client)

```typescript
// src/features/items/infrastructure/items-api.ts
import { apiClient } from '@/shared/api/client';
import type { CreateItemInput, Item } from '../domain/types';

export const itemsApi = {
  async create(input: CreateItemInput): Promise<Item> {
    return apiClient<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async list(): Promise<Item[]> {
    return apiClient<Item[]>('/items');
  },
};
```

### 4. Application (Hooks)

```typescript
// src/features/items/application/useCreateItem.ts
'use client';

import { useState } from 'react';
import { itemsApi } from '../infrastructure/items-api';
import type { CreateItemInput } from '../domain/types';

export function useCreateItem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (input: CreateItemInput) => {
    setIsLoading(true);
    try {
      const item = await itemsApi.create(input);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createItem, isLoading, error };
}
```

### 5. Presentation (Components)

```typescript
// src/features/items/presentation/CreateItemForm.tsx
'use client';

import { useCreateItem } from '../application/useCreateItem';
// ... component implementation
```

### 6. Add Tests

```typescript
// __tests__/unit/features/items/useCreateItem.spec.ts
describe('useCreateItem', () => {
  it('creates item and returns it', async () => {
    const { result } = renderHook(() => useCreateItem());
    
    const item = await result.current.createItem({ name: 'Test' });
    
    expect(item.name).toBe('Test');
  });
});
```

## API Client Pattern

### Base Client

```typescript
// src/shared/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.user.local:8080';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
```

## Testing

See [TESTING.md](apps/user-app/frontend/TESTING.md) for detailed patterns.

### Quick Reference

```bash
# Run tests
make test-user-app
make test-backoffice

# From inside container
pnpm test
pnpm test:watch
```

### MSW for API Mocking

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      accessToken: 'mock-token',
      user: { id: '1', email: body.email, name: 'Test', role: 'ROLE_USER' },
    });
  }),
];
```

## Styling

Use Tailwind CSS for all styling:

```typescript
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Submit
</button>
```

## Best Practices

### DO

- Follow Clean Architecture layers
- Use Server Components by default
- Put business logic in hooks, not components
- Validate inputs with Zod
- Write tests for hooks and components
- Use semantic HTML and ARIA labels

### DON'T

- Put API calls directly in components
- Skip the domain layer
- Use `any` types
- Forget 'use client' for interactive components
- Test implementation details

## Related Documentation

- [DDD_GUIDE.md](./DDD_GUIDE.md) - Overall architecture
- [INVARIANTS.md](./INVARIANTS.md) - Architectural rules
- [AGENTS.md](./AGENTS.md) - Commands reference
