# @dungeonman/auth

Shared authentication utilities and JWT handling for all modules.

## Purpose

This package provides JWT token handling and role-based access control utilities shared across all frontends and backends.

## Features

- JWT token decoding and validation
- User information extraction from tokens
- Role checking utilities
- TypeScript types for auth concerns

## Installation

This package is automatically available to all modules via the monorepo workspace.

```json
{
  "dependencies": {
    "@dungeonman/auth": "workspace:*"
  }
}
```

## Usage

### JWT Token Handling

```typescript
import { decodeJWT, extractUser, isTokenExpired } from '@dungeonman/auth';

// Decode token
const payload = decodeJWT(token);
console.log(payload.sub, payload.email, payload.roles);

// Extract user info
const user = extractUser(token);
console.log(user.id, user.email, user.roles);

// Check if token is expired
if (isTokenExpired(token)) {
  // Redirect to login
}
```

### Role-Based Access Control

```typescript
import { hasRole, hasAnyRole, hasAllRoles, UserRole } from '@dungeonman/auth';

// Check single role
if (hasRole(user, UserRole.ADMIN)) {
  // Admin-only logic
}

// Check if user has any of the roles
if (hasAnyRole(user, [UserRole.ADMIN, UserRole.MODERATOR])) {
  // Moderator features
}

// Check if user has all roles
if (hasAllRoles(user, [UserRole.USER, UserRole.VERIFIED])) {
  // Verified user features
}
```

### Role Guards

```typescript
import { createRoleGuard, createAnyRoleGuard } from '@dungeonman/auth';

// Create a guard function
const requireAdmin = createRoleGuard(UserRole.ADMIN);

if (requireAdmin(user)) {
  // User is admin
} else {
  // Access denied
}

// Multiple roles guard (user needs ANY of these)
const requireStaff = createAnyRoleGuard([UserRole.ADMIN, UserRole.MODERATOR]);

if (requireStaff(user)) {
  // User is staff
}
```

## JWT Payload Structure

The JWT tokens issued by backends should follow this structure:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["user", "admin"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## TypeScript Types

```typescript
import { JWTPayload, AuthUser, UserRole } from '@dungeonman/auth';

const payload: JWTPayload = {
  sub: "123",
  email: "user@example.com",
  roles: ["user"],
  iat: Date.now(),
  exp: Date.now() + 3600,
};

const user: AuthUser = {
  id: "123",
  email: "user@example.com",
  roles: ["user", "admin"],
};
```

## User Roles

Predefined roles in `UserRole` enum:
- `USER` - Regular user
- `ADMIN` - Administrator
- `MODERATOR` - Moderator

Add more roles as needed by extending the enum in `src/types.ts`.

## Backend Integration (NestJS)

```typescript
// In your auth guard
import { verifyJWT } from '@dungeonman/auth';

const payload = verifyJWT(token, process.env.JWT_SECRET);

// In your controller
import { hasRole, UserRole } from '@dungeonman/auth';

if (!hasRole(request.user, UserRole.ADMIN)) {
  throw new ForbiddenException('Admin access required');
}
```

## Frontend Integration (Next.js/React)

```typescript
// In your auth context/hook
import { extractUser, isTokenExpired } from '@dungeonman/auth';

const user = extractUser(token);

// In your components
import { hasRole, UserRole } from '@dungeonman/auth';

function AdminPanel() {
  const { user } = useAuth();
  
  if (!hasRole(user, UserRole.ADMIN)) {
    return <AccessDenied />;
  }
  
  return <AdminDashboard />;
}
```

## Development

```bash
# Build the package
cd shared/packages/auth
pnpm build

# The package is automatically available to all modules
```

## Structure

```
shared/packages/auth/
├── src/
│   ├── index.ts           # Main exports
│   ├── types.ts           # TypeScript types and schemas
│   ├── jwt.ts             # JWT utilities
│   └── role-guard.ts      # Role checking utilities
├── package.json
└── tsconfig.json
```
