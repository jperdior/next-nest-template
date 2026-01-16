# Project Initialization Guide

This guide explains how to initialize the template with a custom project name.

## Overview

By default, the template uses `testproject` as the project name. This affects:
- Network names (`testproject_network`)
- Container names (`testproject_user_app_backend`, etc.)
- Package namespace (`@testproject/...`)

## When to Initialize

**Initialization is optional.** Initialize if:
- You want a custom project name for clarity
- You're working on multiple projects using this template
- You want to avoid potential naming conflicts

**Skip initialization if:**
- You're exploring the template
- You're fine with the default `testproject` name

## How to Initialize

### Step 1: Run Initialization

```bash
make init
```

When prompted, enter your project name (lowercase, alphanumeric, hyphens only).

**Valid examples**: `myproject`, `my-awesome-app`, `project123`
**Invalid**: `MyProject`, `my_project`, `my project`

### Step 2: Start Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd shared/contexts/Infrastructure/persistence && pnpm prisma generate

# Start services
cd ../../..
make start
```

## What Gets Updated

The initialization script updates:
- `Makefile` - PROJECT_NAME variable
- `infra/docker-compose.yml` - Network and container names
- `modules/*/ops/docker-compose.yml` - Container names
- `package.json` - Package name

## Troubleshooting

### Network errors after initialization

```bash
make clean
make start
```

### Containers using old names

```bash
docker compose -f ops/docker-compose.yml down
docker compose -f infra/docker-compose.yml down
make start
```

## Questions?

See [README.md](./README.md) for project overview and [AGENTS.md](./AGENTS.md) for development commands.
