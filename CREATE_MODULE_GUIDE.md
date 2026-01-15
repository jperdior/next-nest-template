# Create Module Command Guide

## Overview

The `/create-module` command allows you to quickly scaffold new modules in the monorepo with AI assistance.

## How It Works

### Invocation

Simply type in Cursor:
```
/create-module
```

The AI will guide you through the process interactively.

### Interactive Flow

1. **Module Name**
   ```
   AI: What is the module name? (lowercase, alphanumeric, hyphens only)
   You: analytics
   ```

2. **Module Type**
   ```
   AI: What should this module include?
       1. Both frontend and backend
       2. Frontend only
       3. Backend only
   You: 1
   ```

3. **Module Purpose**
   ```
   AI: What is the purpose of this module? (for README)
   You: Analytics dashboard for viewing user metrics
   ```

4. **Root Makefile Commands (Optional)**
   ```
   AI: Would you like to add convenience commands to the root Makefile? (y/n)
   You: y
   ```

### What Gets Created

```
modules/[your-module]/
├── backend/                    # Full NestJS backend (if selected)
│   ├── src/
│   │   ├── context/
│   │   └── shared/
│   ├── test/
│   ├── AGENTS.md              # Development guidelines
│   ├── TESTING.md             # ⚠️ REQUIRED: Testing guide
│   ├── package.json
│   └── ...
│
├── frontend/                   # Full Next.js frontend (if selected)
│   ├── src/
│   │   ├── app/
│   │   └── features/
│   ├── __tests__/
│   ├── AGENTS.md              # Development guidelines
│   ├── TESTING.md             # ⚠️ REQUIRED: Testing guide
│   ├── package.json
│   └── ...
│
├── ops/
│   ├── docker-compose.yml     # Module services configuration
│   ├── Dockerfile.backend     # Backend container
│   └── Dockerfile.frontend    # Frontend container
│
├── specs/
│   └── openapi.yaml           # API specification (if backend)
│
├── Makefile                    # Module-specific commands
└── README.md                   # Module documentation
```

**⚠️ IMPORTANT**: Each module includes `TESTING.md` files that MUST be read before implementing features. Tests are not optional!

## Port Assignment

Ports are automatically assigned based on module count:

| Module # | Frontend | Backend | Prisma Studio |
|----------|----------|---------|---------------|
| 0 (user-app) | 3000 | 3001 | 5555 |
| 1 (backoffice) | 3010 | 3011 | 5556 |
| 2 (analytics) | 3020 | 3021 | 5557 |
| 3 (reports) | 3030 | 3031 | 5558 |

Pattern: Base + (module_count × 10)

## Example: Creating Analytics Module

### Step by Step

```bash
# 1. Invoke command in Cursor
/create-module

# 2. Answer questions
Module name: analytics
Type: 1 (Both)
Purpose: Analytics dashboard for viewing user metrics
Root commands: y

# 3. AI creates everything
✅ Created modules/analytics/
✅ Created frontend structure
✅ Created backend structure
✅ Created ops/ with Docker configs
✅ Created Makefile
✅ Updated root orchestration
✅ Created README.md

# 4. Start using it
cd modules/analytics
make start

# Or from root
make start-analytics
```

## What Gets Updated

### Root Files

1. **ops/docker-compose.yml**
   ```yaml
   include:
     - ../modules/analytics/ops/docker-compose.yml  # ADDED
   ```

2. **Root Makefile** (if you chose yes)
   ```makefile
   start-analytics:
       @$(MAKE) -C modules/analytics start
   
   logs-analytics:
       @$(MAKE) -C modules/analytics logs
   # ... etc
   ```

3. **/etc/hosts** (automatic via `make setup-hosts`)
   ```
   127.0.0.1 analytics.local          # ADDED
   127.0.0.1 api.analytics.local      # ADDED
   ```
   
   These domains are automatically extracted from your module's Traefik configuration and added when you run `make start`.

### Module Files

All files are created from templates with:
- ✅ Correct module name
- ✅ Unique ports
- ✅ Proper container names (`testproject_analytics_backend`)
- ✅ Network configuration (`testproject_network`)
- ✅ Database references (`@testproject/database`)
- ✅ Volume mounts
- ✅ Working Makefile

## Testing the Command

### Test Case 1: Full Module (Frontend + Backend)

```
/create-module
Name: test-full
Type: 1
Purpose: Test module with both services
Root commands: y
```

Expected:
- ✅ Both frontend and backend created
- ✅ Ports: 3020 (frontend), 3021 (backend)
- ✅ Can run `make start-test-full`

### Test Case 2: Backend Only

```
/create-module
Name: test-api
Type: 3
Purpose: API-only test module
Root commands: n
```

Expected:
- ✅ Only backend created
- ✅ No frontend directory
- ✅ OpenAPI spec created
- ✅ Port: 3031 (backend)

### Test Case 3: Frontend Only

```
/create-module
Name: test-ui
Type: 2
Purpose: UI-only test module
Root commands: n
```

Expected:
- ✅ Only frontend created
- ✅ No backend directory
- ✅ No OpenAPI spec
- ✅ Port: 3040 (frontend)

## Validation Rules

The command validates:

1. **Module Name**
   - ✅ Valid: `analytics`, `user-reports`, `api-v2`
   - ❌ Invalid: `Analytics`, `user_reports`, `api v2`, `-invalid`

2. **Port Conflicts**
   - Automatically avoids conflicts by counting existing modules
   - Each new module gets next available port range

3. **Container Names**
   - Format: `testproject_[modulename]_[service]`
   - Example: `testproject_analytics_backend`

## After Module Creation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Local Domains (Automatic)

When you run `make start`, the system will automatically:
- ✅ Scan all module docker-compose files for Traefik domains
- ✅ Add them to your `/etc/hosts` file
- ✅ Configure pretty URLs like `http://[module].local:8080`

You can also run manually:
```bash
make setup-hosts
```

### 3. **READ TESTING.MD FIRST!**

**⚠️ CRITICAL**: Before writing any code:
- **Backend**: Read `backend/TESTING.md`
- **Frontend**: Read `frontend/TESTING.md`

Tests are developed **alongside** features, not after!

### 4. Customize Module

- Update `specs/openapi.yaml` with your API endpoints
- Implement your domain logic in `backend/src/context/` **with tests**
- Build your UI in `frontend/src/features/` **with tests**

### 5. Generate Types (if backend)

```bash
cd modules/[your-module]
make codegen
```

### 6. Start Module

```bash
# Start all services (automatically sets up hosts)
make start  # from root

# Or start just your module (requires infrastructure)
cd modules/[your-module]
make start
```

### 7. Access Your Module

Your module will be accessible via:

**Direct ports:**
- Frontend: `http://localhost:[frontend_port]`
- Backend: `http://localhost:[backend_port]`
- Prisma Studio: `http://localhost:[prisma_port]`

**Pretty URLs (via Traefik):**
- Frontend: `http://[module].local:8080`
- Backend API: `http://api.[module].local:8080`

Example for `analytics` module:
- `http://analytics.local:8080` → Frontend
- `http://api.analytics.local:8080` → Backend API

## Troubleshooting

### "Module already exists"

The AI will check and warn you. Choose a different name.

### Port conflicts

If ports are already in use:
- Stop other services
- Or manually edit `ops/docker-compose.yml` to use different ports

### "Network not found"

Ensure infrastructure is started:
```bash
make start-infra
```

### Dependencies not working

Run from project root:
```bash
pnpm install
```

## Tips

1. **Module naming**: Use descriptive names that reflect the module's purpose
2. **Start simple**: Create with both frontend and backend, remove what you don't need
3. **Customize immediately**: The generated code is a starting point
4. **Use shared packages**: Import `@testproject/database` and `@testproject/auth`
5. **Test early**: Start your module right after creation to ensure everything works

## Advanced Usage

### Creating Specialized Modules

**API Gateway**:
```
Name: api-gateway
Type: Backend only
Purpose: API gateway for routing and authentication
```

**Admin Dashboard**:
```
Name: admin-v2
Type: Both
Purpose: Next-generation admin interface
```

**Background Worker**:
```
Name: job-processor
Type: Backend only
Purpose: Background job processing
```

### Modifying Templates

To customize what gets generated:
1. Edit `modules/user-app/` (used as template)
2. Future modules will inherit changes
3. Or manually edit after generation

## Comparison: Before vs After

**Before `/create-module`:**
- Manually copy module directory
- Find/replace all module names
- Update ports manually
- Add to docker-compose
- Create Makefile
- Update root Makefile
- Prone to errors

**After `/create-module`:**
- Type `/create-module`
- Answer 3-4 questions
- Module ready in seconds
- Everything configured correctly
- No manual updates needed

## Questions?

- See [README.md](./README.md) for project overview
- See [AGENTS.md](./AGENTS.md) for development guide
- See [.cursor/commands/README.md](./.cursor/commands/README.md) for command documentation
