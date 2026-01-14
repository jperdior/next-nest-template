# Creating a New Bounded Context

This guide walks you through creating a new bounded context step-by-step.

## Prerequisites

- Understanding of DDD concepts (see `../../DDD_GUIDE.md`)
- Clear domain/subdomain you want to model
- List of entities and use cases

---

## Step-by-Step Guide

### Step 1: Create Directory Structure

```bash
# Replace 'users' with your context name
CONTEXT_NAME="users"

mkdir -p shared/contexts/${CONTEXT_NAME}/{domain/{entities,value-objects,repositories},application,infrastructure/{database/{prisma,src},persistence}}
```

This creates:
```
shared/contexts/users/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
├── application/
└── infrastructure/
    ├── database/
    │   ├── prisma/
    │   └── src/
    └── persistence/
```

---

### Step 2: Create Prisma Schema

Create `infrastructure/database/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../generated"
}

// Define your domain models
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Key points**:
- `output = "../generated"` → generates client in `infrastructure/database/generated/`
- Use `@@map()` to specify table names
- Include timestamps (`createdAt`, `updatedAt`)

---

### Step 3: Create Database Package

Create `infrastructure/database/package.json`:

```json
{
  "name": "@testproject/context-users",
  "version": "1.0.0",
  "description": "Users context database schema and Prisma client",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc",
    "generate": "prisma generate",
    "migrate": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev",
    "studio": "prisma studio",
    "clean": "rimraf dist generated"
  },
  "dependencies": {
    "@prisma/client": "^5.8.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "prisma": "^5.8.0",
    "rimraf": "^5.0.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

Create `infrastructure/database/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "generated"]
}
```

Create `infrastructure/database/src/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `infrastructure/database/src/database.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

Create `infrastructure/database/src/index.ts`:

```typescript
export { PrismaClient } from '../generated';
export * from '../generated';
export { PrismaService } from './prisma.service';
export { DatabaseModule } from './database.module';
```

---

### Step 4: Generate Prisma Client

```bash
cd shared/contexts/users/infrastructure/database
pnpm install
pnpm generate
```

This generates the Prisma client in `generated/`.

---

### Step 5: Create Domain Entities

Create `domain/entities/user.entity.ts`:

```typescript
export interface UserProps {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get status(): string {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  activate(): void {
    if (this.props.status === 'active') {
      throw new Error('User is already active');
    }
    this.props.status = 'active';
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    if (this.props.status === 'suspended') {
      throw new Error('User is already suspended');
    }
    this.props.status = 'suspended';
    this.props.updatedAt = new Date();
  }

  toPlainObject(): UserProps {
    return { ...this.props };
  }
}
```

**Key points**:
- Entities encapsulate business rules
- Use getters for immutability
- Add domain methods (not just getters/setters)

---

### Step 6: Create Value Objects (Optional)

Create `domain/value-objects/email.value-object.ts`:

```typescript
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

**Key points**:
- Value objects are immutable
- Enforce validation in constructor
- Provide equality comparison

---

### Step 7: Create Repository Interface

Create `domain/repositories/user.repository.interface.ts`:

```typescript
import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryInterface {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
```

**Key points**:
- Define as interface (port)
- Use Symbol for DI token
- Return domain entities, not Prisma types

---

### Step 8: Implement Repository

Create `infrastructure/persistence/user-prisma.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/src/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserPrismaRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const data = user.toPlainObject();
    const created = await this.prisma.user.create({ data });
    return new UserEntity(created);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? new UserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? new UserEntity(user) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users.map(user => new UserEntity(user));
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const data = user.toPlainObject();
    const updated = await this.prisma.user.update({
      where: { id: data.id },
      data,
    });
    return new UserEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
```

**Key points**:
- Implement repository interface
- Convert between Prisma types and domain entities
- Use PrismaService from context's database

---

### Step 9: Create Use Cases

Create `application/create-user/create-user.input.ts`:

```typescript
export interface CreateUserInput {
  email: string;
  name: string;
}
```

Create `application/create-user/create-user.output.ts`:

```typescript
export interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Create `application/create-user/create-user.service.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserInput } from './create-user.input';
import { CreateUserOutput } from './create-user.output';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // Check if email already exists
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    // Create domain entity
    const user = new UserEntity({
      id: uuid(),
      email: input.email,
      name: input.name,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persist
    const created = await this.userRepository.create(user);

    // Return output
    return created.toPlainObject();
  }
}
```

**Key points**:
- Use cases orchestrate domain logic
- Inject repository via interface
- Return output DTOs, not entities

---

### Step 10: Create Context Module

Create `users.module.ts` at the context root:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/src/database.module';
import { CreateUserService } from './application/create-user/create-user.service';
import { GetUserService } from './application/get-user/get-user.service';
import { UserPrismaRepository } from './infrastructure/persistence/user-prisma.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

/**
 * Users Bounded Context Module
 * 
 * This module encapsulates the Users bounded context, providing:
 * - Domain entities and value objects
 * - Application use cases (CreateUser, GetUser, etc.)
 * - Infrastructure implementations (Prisma repository)
 * 
 * This context can be imported by any module that needs user management.
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    // Use cases
    CreateUserService,
    GetUserService,
    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [
    // Export use cases for modules to consume
    CreateUserService,
    GetUserService,
  ],
})
export class UsersContextModule {}
```

---

### Step 11: Update Workspace

The context database is automatically discovered via `pnpm-workspace.yaml`:

```yaml
packages:
  - 'shared/contexts/*/infrastructure/database'
```

Run `pnpm install` at the root to link the package.

---

### Step 12: Use in Modules

**Import context in module**:

```typescript
// modules/user-app/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { UsersContextModule } from '@shared/contexts/users/users.module';

@Module({
  imports: [UsersContextModule],
})
export class AppModule {}
```

**Update tsconfig paths** (already configured):

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/contexts/*": ["../../../shared/contexts/*"]
    }
  }
}
```

**Use in controllers**:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserService } from '@shared/contexts/users/application/create-user/create-user.service';

@Controller('users')
export class UsersController {
  constructor(private createUser: CreateUserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }
}
```

---

### Step 13: Create Migration

```bash
make db-migrate-create context=users name=initial_schema
```

This creates a migration in `shared/contexts/users/infrastructure/database/prisma/migrations/`.

---

### Step 14: Apply Migration

```bash
make db-migrate-context context=users
```

Or apply all migrations:

```bash
make db-migrate-all
```

---

## Testing Your Context

### Unit Tests

Test domain entities:

```typescript
// domain/entities/user.entity.spec.ts
describe('UserEntity', () => {
  it('should activate user', () => {
    const user = new UserEntity({
      id: '1',
      email: 'test@example.com',
      name: 'Test',
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user.activate();
    expect(user.status).toBe('active');
  });
});
```

### Integration Tests

Test use cases:

```typescript
// application/create-user/create-user.service.spec.ts
describe('CreateUserService', () => {
  let service: CreateUserService;
  let repository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;
    
    service = new CreateUserService(repository);
  });

  it('should create user', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(new UserEntity({
      id: '1',
      email: 'test@example.com',
      name: 'Test',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.execute({
      email: 'test@example.com',
      name: 'Test',
    });

    expect(result.email).toBe('test@example.com');
  });
});
```

---

## Checklist

- [ ] Created directory structure
- [ ] Defined Prisma schema
- [ ] Created database package files
- [ ] Generated Prisma client
- [ ] Implemented domain entities
- [ ] Created value objects (if needed)
- [ ] Defined repository interface
- [ ] Implemented repository
- [ ] Created use cases
- [ ] Created context NestJS module
- [ ] Updated workspace
- [ ] Imported context in modules
- [ ] Created initial migration
- [ ] Applied migration
- [ ] Added tests

---

## Next Steps

- Add more use cases as needed
- Implement domain services if complex logic is shared
- Add event publishing for cross-context communication
- Document your context in a README.md

---

## Resources

- **DDD Guide**: `../../DDD_GUIDE.md`
- **Example Context**: `./example/README.md`
- **Architecture Invariants**: `../../INVARIANTS.md`
