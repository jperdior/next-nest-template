# Project Initialization Guide

This guide explains how to initialize the template with a custom project name.

## Overview

By default, the template uses `dungeonman` as the project name. This affects:
- Network names (`dungeonman_network`)
- Container names (`dungeonman_user_app_backend`, etc.)
- Package name in `package.json`

## When to Initialize

**Initialization is optional.** You should initialize if:
- You want a custom project name for clarity
- You're working on multiple projects using this template
- You want to avoid potential naming conflicts

**You can skip initialization if:**
- You're just exploring the template
- You're fine with the default `testproject` name
- You only have one project using this template

## How to Initialize

### Step 1: Run the Initialization Command

```bash
make init
```

### Step 2: Enter Your Project Name

When prompted:
```
Enter project name (lowercase, alphanumeric, hyphens only): 
```

Enter your desired project name. Requirements:
- Lowercase letters only
- Can include numbers and hyphens
- Must start and end with alphanumeric character
- No spaces or special characters

**Examples:**
- ✅ `myproject`
- ✅ `my-awesome-app`
- ✅ `project123`
- ❌ `MyProject` (uppercase)
- ❌ `my_project` (underscore)
- ❌ `my project` (space)
- ❌ `-myproject` (starts with hyphen)

### Step 3: Confirmation

If the project was already initialized, you'll be asked to confirm:
```
⚠️  Project already initialized as 'myproject'
Do you want to reinitialize? (y/N): 
```

Type `y` to proceed or `n` to cancel.

### Step 4: Start Development

After initialization:

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd shared/database && pnpm generate

# Start services
cd ../..
make start
```

## What Gets Updated

The initialization script updates these files:

### 1. Makefile
```makefile
PROJECT_NAME := your-project-name
```

### 2. Infrastructure Configuration
- `infra/docker-compose.yml` - Network name and container names
- `infra/traefik.yml` - Network name

### 3. Module Configurations
- `modules/user-app/ops/docker-compose.yml` - Container names
- `modules/backoffice/ops/docker-compose.yml` - Container names

### 4. Package Configuration
- `package.json` - Package name

## Network Names

After initialization with project name `myproject`:
- Network: `myproject_network` (was `dungeonman_network`)
- Containers: `myproject_user_app_backend`, `myproject_backoffice_frontend`, etc.

## Reinitializing

You can reinitialize at any time:

```bash
make init
# Confirm reinitialization
# Enter new project name
```

**Note:** If you have running containers, stop them first:
```bash
make stop
make init
make start
```

## Manual Initialization

If you prefer to manually update the project name, edit these files:

1. **Makefile** - `PROJECT_NAME` variable
2. **infra/docker-compose.yml** - Replace `dungeonman_` with `yourname_`
3. **infra/traefik.yml** - Replace `dungeonman_network` with `yourname_network`
4. **modules/user-app/ops/docker-compose.yml** - Replace `dungeonman_` with `yourname_`
5. **modules/backoffice/ops/docker-compose.yml** - Replace `dungeonman_` with `yourname_`
6. **package.json** - Update `name` field

Then restart services:
```bash
make stop
make start
```

## Troubleshooting

### "Network not found" after initialization

If you see network errors after initialization:

```bash
# Clean up old containers
make clean

# Start fresh
make start
```

### Containers using old names

If containers still have old names:

```bash
# Stop and remove all containers
docker compose -f ops/docker-compose.yml down
docker compose -f infra/docker-compose.yml down

# Remove old networks
docker network rm dungeonman_network  # or your old name

# Start fresh
make start
```

### Reverting to default name

To go back to `dungeonman`:

```bash
make init
# Enter: dungeonman
```

Or manually edit the files listed in "Manual Initialization" above.

## Best Practices

1. **Initialize early** - Do it before creating custom code
2. **Use descriptive names** - Choose names that identify your project
3. **Document your choice** - Add your project name to your project README
4. **Consistent naming** - Use the same name across all environments

## Example Session

```bash
$ make init
🚀 Project Initialization
========================

Enter project name (lowercase, alphanumeric, hyphens only): awesome-app

📝 Updating configuration files...

✅ Project initialized as 'awesome-app'!

📋 Access URLs:
   User App Frontend:     http://localhost:3000
   User App Backend:      http://localhost:3001
   Backoffice Frontend:   http://localhost:3010
   Backoffice Backend:    http://localhost:3011
   Traefik Dashboard:     http://localhost:8081

🚀 Next steps:
   1. Install dependencies: pnpm install
   2. Generate Prisma client: cd shared/database && pnpm generate
   3. Start services: make start
```

## Questions?

- See [README.md](./README.md) for general project information
- See [AGENTS.md](./AGENTS.md) for operational guide
- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for architecture details
