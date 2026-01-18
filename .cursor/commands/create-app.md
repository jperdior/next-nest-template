---
description: Create a new thin application (HTTP/UI layer) in the DDD-based monorepo
---

# Create App

Creates a new **thin application** (HTTP/UI layer) in the DDD-based monorepo.

**Important**: Apps are thin layers that consume bounded contexts. Domain logic belongs in `src/`, not in apps!

## Instructions for AI Agent

When the user invokes this command, follow these steps carefully:

### Step 1: Gather Information

Ask the user the following questions:

1. **App name**: "What is the app name? (lowercase, alphanumeric, hyphens only, e.g., analytics, reports, mobile-api)"
   - Validate: Must be lowercase, alphanumeric, hyphens only
   - Must start and end with alphanumeric character
   - Examples: `analytics`, `user-reports`, `mobile-api`

2. **App type**: "What should this app include?"
   - Option 1: Both frontend and backend (full app)
   - Option 2: Frontend only
   - Option 3: Backend only

3. **App purpose**: "What is the purpose of this app? (for README)"

### Step 2: Determine Port Numbers

Count existing apps in `apps/` directory and assign ports:
- Frontend port = 3000 + (app_count * 10)
- Backend port = 3001 + (app_count * 10)

Examples:
- App 0 (user-app): frontend=3000, backend=3001
- App 1 (backoffice): frontend=3010, backend=3011
- App 2 (analytics): frontend=3020, backend=3021

### Step 3: Create Directory Structure

Create the following structure in `apps/[app-name]/`:

```
apps/[app-name]/
├── backend/           (if backend selected)
│   ├── src/
│   │   ├── presentation/
│   │   │   └── http/
│   │   ├── shared/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   ├── AGENTS.md
│   └── TESTING.md (link to user-app)
├── frontend/          (if frontend selected)
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   ├── shared/
│   │   └── styles/
│   ├── __tests__/
│   ├── package.json
│   ├── AGENTS.md
│   └── TESTING.md (link to user-app)
├── ops/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend    (if backend selected)
│   ├── Dockerfile.frontend   (if frontend selected)
│   ├── entrypoint.sh
│   └── entrypoint-frontend.sh
├── specs/
│   ├── openapi.yaml   (if backend selected)
│   └── README.md
├── Makefile
└── README.md
```

### Step 4: Copy Template Files

**If creating backend:**
- Copy from `apps/user-app/backend/` to `apps/[app-name]/backend/`
- Update `package.json` name to `[app-name]-backend`
- Update AGENTS.md with correct URLs and commands
- App uses `@testproject/database` package (shared Prisma)

**If creating frontend:**
- Copy from `apps/user-app/frontend/` to `apps/[app-name]/frontend/`
- Update `package.json` name to `[app-name]-frontend`
- Update AGENTS.md with correct URLs and commands

**Always create ops/ directory with:**

1. `docker-compose.yml` with:
   - Service names: `[app-name]-backend`, `[app-name]-frontend`
   - Container names: `testproject_[appname]_backend`, `testproject_[appname]_frontend`
   - Correct ports assigned in Step 2
   - Network: `testproject_network`
   - DATABASE_URL: `postgresql://postgres:postgres@postgres:5432/testproject?schema=public`
   - Proper volume mounts pointing to `apps/[app-name]/`
   - Depends on postgres, redis, rabbitmq from infra
   - **Backend environment variables:**
     - `FRONTEND_URL: http://[app-name].local:8080` (for CORS)
     - Other standard vars (DATABASE_URL, REDIS_HOST, etc.)
   - **Frontend environment variables:**
     - `NEXT_PUBLIC_API_URL: http://api.[app-name].local:8080`
   - **Traefik labels for routing:**
     - Backend: `Host(\`api.[app-name].local\`)`
     - Frontend: `Host(\`[app-name].local\`)`

2. `Dockerfile.backend` (if backend):
   - Copy from `apps/user-app/ops/Dockerfile.backend`
   - Update all paths to reference `apps/[app-name]/`

3. `Dockerfile.frontend` (if frontend):
   - Copy from `apps/user-app/ops/Dockerfile.frontend`
   - Update all paths to reference `apps/[app-name]/`

4. `entrypoint.sh` and `entrypoint-frontend.sh`:
   - Copy from `apps/user-app/ops/`

### Step 5: Create specs/openapi.yaml

If backend is included, copy `apps/user-app/specs/openapi.yaml` and update:
- Title to "[AppName] API"
- Description
- Remove user-app specific endpoints (keep structure)

Also copy `apps/user-app/specs/README.md`.

### Step 6: Create App Makefile

Create `apps/[app-name]/Makefile` with:
- APP_NAME variable set to app name
- Commands: start, stop, restart, logs, shell-be, shell-fe, test, lint, codegen
- Container names using: `testproject_[appname]_backend` and `testproject_[appname]_frontend`

Copy structure from `apps/user-app/Makefile` and update container names.

### Step 7: Create App README.md

Create a README with:
- App purpose (from user input)
- Structure overview
- Quick start commands
- Access URLs with the assigned ports

### Step 8: Create AGENTS.md Files

**Backend AGENTS.md:**
```markdown
# [AppName] Backend - Agent Guidelines

## Quick Links

- **Architecture**: See [BACKEND_ARCHITECTURE.md](../../../BACKEND_ARCHITECTURE.md)
- **DDD Guide**: See [DDD_GUIDE.md](../../../DDD_GUIDE.md)
- **Testing**: See [../../user-app/backend/TESTING.md](../../user-app/backend/TESTING.md)

## Commands

From this directory:
pnpm dev, pnpm test, etc.

From project root:
make start-[app-name], make test-[app-name], etc.

## Access URLs
- Backend API: http://api.[app-name].local:8080
- Frontend: http://[app-name].local:8080

## Key Reminder
Apps are THIN - domain logic lives in src/ bounded contexts.
```

**Frontend AGENTS.md:**
```markdown
# [AppName] Frontend - Agent Guidelines

## Quick Links

- **Architecture**: See [FRONTEND_ARCHITECTURE.md](../../../FRONTEND_ARCHITECTURE.md)
- **Testing**: See [../../user-app/frontend/TESTING.md](../../user-app/frontend/TESTING.md)

## Commands
...

## Access URLs
- Frontend: http://[app-name].local:8080
- Backend API: http://api.[app-name].local:8080
```

### Step 9: Update Root Orchestration

Update `ops/docker-compose.yml` to include the new app:
```yaml
include:
  - ../infra/docker-compose.yml
  - ../apps/user-app/ops/docker-compose.yml
  - ../apps/backoffice/ops/docker-compose.yml
  - ../apps/[app-name]/ops/docker-compose.yml  # ADD THIS
```

### Step 10: Update Root Makefile

Add to root `Makefile`:
```makefile
# [AppName] App
start-[app-name]:
	@$(MAKE) -C apps/[app-name] start

stop-[app-name]:
	@$(MAKE) -C apps/[app-name] stop

logs-[app-name]:
	@$(MAKE) -C apps/[app-name] logs

shell-[app-name]-be:
	@$(MAKE) -C apps/[app-name] shell-be

shell-[app-name]-fe:
	@$(MAKE) -C apps/[app-name] shell-fe

test-[app-name]:
	@$(MAKE) -C apps/[app-name] test
```

Also update the help section.

### Step 11: Update pnpm-workspace.yaml

Add the new app to `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*/backend'
  - 'apps/*/frontend'
  - 'src/shared'
  - 'src/shared/infrastructure/persistence'
  - 'src/backoffice'
  - 'src/user-facing-app'
```

### Step 12: Summary

Provide a summary:
```
App Created: [app-name]

Structure:
   - Backend: apps/[app-name]/backend/ [if created]
   - Frontend: apps/[app-name]/frontend/ [if created]
   - Ops: apps/[app-name]/ops/
   - Specs: apps/[app-name]/specs/ [if backend]

Access URLs (via Traefik):
   - Frontend: http://[app-name].local:8080 [if created]
   - Backend API: http://api.[app-name].local:8080 [if created]
   
   Add to /etc/hosts:
   127.0.0.1 [app-name].local api.[app-name].local

Next Steps:
   1. Review and customize the app code
   2. Update specs/openapi.yaml with your API endpoints [if backend]
   3. Run: make codegen (from project root)
   4. Run: make start (from root) to start all services
   5. Or: cd apps/[app-name] && make start (after infrastructure is running)

Tips:
   - Infrastructure must be running: make start-infra
   - Apps are THIN - domain logic goes in src/ bounded contexts
   - Import bounded contexts in app.module.ts
   - Always use Traefik domains ([app-name].local:8080) not localhost ports
   - See DDD_GUIDE.md for architecture patterns
```

## Important Notes

1. **Always validate app name** before proceeding
2. **Always use testproject** as the network and database name
3. **Port allocation is critical** - ensure no conflicts
4. **Update docker-compose volume paths** to point to the correct app
5. **Container names follow pattern**: `testproject_[appname]_[service]`
6. **Apps are THIN** - they import bounded contexts from `src/`
7. **No domain logic in apps** - entities, repositories go in `src/[context]/`
8. **Database schema** is shared at `src/shared/infrastructure/persistence/prisma/schema.prisma`

## Docker Compose Template

Key parts for the app's `ops/docker-compose.yml`:

```yaml
services:
  [app-name]-backend:
    build:
      context: ../../..
      dockerfile: apps/[app-name]/ops/Dockerfile.backend
    container_name: testproject_[appname]_backend
    environment:
      PORT: [backend_port]
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/testproject?schema=public
      FRONTEND_URL: http://[app-name].local:8080
    ports:
      - "[backend_port]:[backend_port]"
    volumes:
      - ../../../apps/[app-name]/backend:/app/apps/[app-name]/backend
      - ../../../src:/app/src
    networks:
      - testproject_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.[appname]-api.rule=Host(`api.[app-name].local`)"
      - "traefik.http.services.[appname]-api.loadbalancer.server.port=[backend_port]"
    
  [app-name]-frontend:
    build:
      context: ../../..
      dockerfile: apps/[app-name]/ops/Dockerfile.frontend
    container_name: testproject_[appname]_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://api.[app-name].local:8080
    ports:
      - "[frontend_port]:3000"
    networks:
      - testproject_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.[appname].rule=Host(`[app-name].local`)"
      - "traefik.http.services.[appname].loadbalancer.server.port=3000"

networks:
  testproject_network:
    external: true
```

## Example Invocation

```
User: /create-app
AI: What is the app name? (lowercase, alphanumeric, hyphens only)
User: analytics
AI: What should this app include?
    1. Both frontend and backend
    2. Frontend only
    3. Backend only
User: 1
AI: What is the purpose of this app?
User: Analytics dashboard for viewing user metrics and reports
AI: [Proceeds to create app...]
    App Created: analytics
    [... full summary ...]
```
