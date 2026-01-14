# Project Initialization Guide

This template includes a `make init` command that sets up the project with a custom name and configures all necessary files.

## Important: First Time Setup Required

When you first clone or use this template, the project name is set to the default value `testproject`. **You should initialize it with your own project name before starting development.**

If you try to run `make start` without initializing, you'll see:

```bash
⚠️  Warning: Using default template project name 'testproject'

This appears to be an uninitialized template.
It's recommended to run 'make init' to set a custom project name.

Continue with 'testproject' anyway? (y/N):
```

## Quick Start

When using this template for the first time, run:

```bash
make init
```

This will:
1. Prompt you for a project name
2. Validate the project name (lowercase, alphanumeric, hyphens only)
3. Create backups of modified files (`.bak` extension)
4. Update all configuration files with your project name
5. **Automatically update your `/etc/hosts` file** (requires sudo on macOS/Linux)
6. Display access URLs for all services

## Example

```bash
$ make init
🚀 Project Initialization
========================

Enter project name (lowercase, alphanumeric, hyphens only): myproject

📝 Creating backups...

🔧 Updating configuration files...

🌐 Configuring hosts file...
   📝 Adding entries to /etc/hosts
   ⚠️  This requires sudo access...
Password: [enter your password]
   ✅ Hosts file updated successfully!

✅ Project initialized as 'myproject'!

📋 Access URLs:
   Frontend:  http://frontend.myproject:8082 or http://localhost:8080
   Backend:   http://backend.myproject:8082 or http://localhost:8081
   Traefik:   http://traefik.myproject:8082 or http://localhost:8083
   RabbitMQ:  http://rabbitmq.myproject:8082 or http://localhost:15672

🚀 Next step: Start the services
   make start
```

## Hosts File Configuration

The `make init` command **automatically updates your hosts file** with the necessary domain mappings.

### macOS/Linux

The init script will:
- Detect if entries already exist (skips if found)
- Request sudo access to modify `/etc/hosts`
- Add the required entries automatically

You'll see:
```
🌐 Configuring hosts file...
   📝 Adding entries to /etc/hosts
   ⚠️  This requires sudo access...
Password: [enter your password]
   ✅ Hosts file updated successfully!
```

### Windows

On Windows (Git Bash, WSL, etc.), the script will detect the OS but **manual configuration is required**:

1. Run your terminal as Administrator
2. Re-run `make init`, or
3. Manually add to `C:\Windows\System32\drivers\etc\hosts`:
   ```
   127.0.0.1 backend.myproject frontend.myproject traefik.myproject rabbitmq.myproject
   ```

### Manual Configuration (if needed)

If automatic configuration fails, you can add entries manually:

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows:**
1. Run Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`

Add the line:
```
127.0.0.1 backend.yourproject frontend.yourproject traefik.yourproject rabbitmq.yourproject
```

## Starting the Services

After initialization, start your services:

```bash
make start
```

You'll see output like:
```
Starting all services...
Services started! Access:
  Frontend:  http://frontend.myproject:8082
  Backend:   http://backend.myproject:8082
  Traefik:   http://traefik.myproject:8082
  RabbitMQ:  http://rabbitmq.myproject:8082 (guest/guest)
```

### Access Methods

You can access services in two ways:

**1. Via Custom Domains (through Traefik on port 8082):**
- `http://frontend.myproject:8082`
- `http://backend.myproject:8082`
- `http://traefik.myproject:8082` - Dashboard
- `http://rabbitmq.myproject:8082` - Management UI

**2. Direct Port Access (bypass Traefik):**
- `http://localhost:8080` - Frontend
- `http://localhost:8081` - Backend
- `http://localhost:8083` - Traefik Dashboard
- `http://localhost:15672` - RabbitMQ Management UI

## Project Name Validation Rules

Your project name must:
- Be lowercase only
- Use only alphanumeric characters and hyphens
- Start and end with an alphanumeric character
- Be at least 2 characters long

### Valid Examples
- `myproject`
- `my-project`
- `project123`
- `my-project-v2`

### Invalid Examples
- `MyProject` (uppercase)
- `my_project` (underscore)
- `-myproject` (starts with hyphen)
- `myproject-` (ends with hyphen)
- `my project` (space)

## Reinitializing

If you need to change your project name, run `make init` again. You'll be prompted to confirm:

```bash
⚠️  Project already initialized as 'oldproject'
Do you want to reinitialize? (y/N):
```

Answer `y` to proceed with reinitialization.

**Note:** If your project is still using the default `testproject` name, `make init` will proceed directly without prompting, as it recognizes this is the template default.

## What Gets Updated

The `make init` command updates:

**Infrastructure Configuration:**
1. **Makefile** - Sets the `PROJECT_NAME` variable
2. **ops/docker/docker-compose.yml** - Updates all service names, container names, network names, and Traefik host rules
3. **ops/docker/traefik/traefik.yml** - Updates the Docker network name

**Application Code:**
4. **package.json** - Updates the `name` field
5. **backend/src/main.ts** - Updates Swagger API title and description
6. **frontend/src/app/layout.tsx** - Updates page metadata title and header text
7. **frontend/src/app/page.tsx** - Updates welcome message
8. **backend/TESTING.md** - Updates test database name in examples

**Project Name Formatting:**
- Lowercase with hyphens for technical names: `my-project`
- Title case for display names: `My Project`

Backup files (`.bak`) are created for all modified files before any changes.

## Troubleshooting

### "Warning: Using default template project name 'testproject'"

This warning appears when running `make start` with the default template name. You have two options:

1. **Recommended:** Press `N` and run `make init` to set a custom project name
2. Press `Y` to continue with the default name (not recommended for actual projects)

### "Error: Project not initialized!"

If you see this error when running `make start`, the PROJECT_NAME variable is empty. Run `make init` first.

### Domains not resolving

If domains aren't resolving:

1. **Verify hosts file entries:**
   ```bash
   # macOS/Linux
   grep myproject /etc/hosts
   
   # Windows
   findstr myproject C:\Windows\System32\drivers\etc\hosts
   ```

2. **If entries are missing**, add them manually or re-run `make init`

3. **Clear DNS cache** (if needed):
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

### Services not accessible via domain

1. Check that Traefik is running: `docker ps | grep traefik`
2. Verify your hosts file has the correct entries
3. Try accessing directly via ports:
   - Frontend: http://localhost:8080
   - Backend: http://localhost:8081
   - Traefik Dashboard: http://localhost:8083

### Port conflicts

If you get port conflicts (8080, 8081, 8082, 8083), you can modify the port mappings in `ops/docker/docker-compose.yml` after initialization.

## Files Modified

After running `make init`, the following files will be updated with your project name:

**Infrastructure & Configuration:**
- `Makefile` - PROJECT_NAME variable
- `ops/docker/docker-compose.yml` - Service names, containers, networks
- `ops/docker/traefik/traefik.yml` - Network configuration
- `.env` - Project name reference (if created)

**Application Code:**
- `package.json` - Package name
- `backend/src/main.ts` - API title and description (Swagger docs)
- `frontend/src/app/layout.tsx` - Page title and header
- `frontend/src/app/page.tsx` - Welcome message
- `backend/TESTING.md` - Test database name examples

**Project Name Formats:**
- Technical/slug format: `my-awesome-project` (lowercase, hyphens)
- Display format: `My Awesome Project` (title case, spaces)

**Backup files created (`.bak` extension):**
- All modified files are backed up before changes
