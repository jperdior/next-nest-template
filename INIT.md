# Project Initialization Guide

This template includes a `make init` command that sets up the project with a custom name and configures all necessary files.

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
5. Display instructions for updating your `/etc/hosts` file

## Example

```bash
$ make init
🚀 Project Initialization
========================

Enter project name (lowercase, alphanumeric, hyphens only): myproject

📝 Creating backups...

🔧 Updating configuration files...

✅ Project initialized as 'myproject'!

📋 Next steps:

1️⃣  Add these lines to your /etc/hosts file:

    127.0.0.1 backend.myproject frontend.myproject traefik.myproject rabbitmq.myproject

2️⃣  Start the services:

    make start

💡 To edit /etc/hosts on macOS/Linux:
    sudo nano /etc/hosts
```

## Updating /etc/hosts

After running `make init`, you need to add the domain mappings to your hosts file:

### macOS/Linux

```bash
sudo nano /etc/hosts
```

Add the line shown in the init output, for example:
```
127.0.0.1 backend.myproject frontend.myproject traefik.myproject rabbitmq.myproject
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

### Windows

1. Run Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`
3. Add the line shown in the init output
4. Save the file

## Starting the Services

After initialization, start your services:

```bash
make start
```

You'll see output like:
```
Starting all services...
Services started! Access:
  Frontend:  http://frontend.myproject
  Backend:   http://backend.myproject
  Traefik:   http://traefik.myproject
  RabbitMQ:  http://rabbitmq.myproject (guest/guest)
```

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

## What Gets Updated

The `make init` command updates:

1. **Makefile** - Sets the `PROJECT_NAME` variable
2. **ops/docker/docker-compose.yml** - Updates all service names, container names, network names, and Traefik host rules
3. **ops/docker/traefik/traefik.yml** - Updates the Docker network name

Backup files (`.bak`) are created before any modifications.

## Troubleshooting

### "Error: Project not initialized!"

If you see this error when running `make start`, you need to run `make init` first.

### Domains not resolving

Make sure you've added the domains to your `/etc/hosts` file as shown in the init output.

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

After running `make init`, the following files will contain your project name:

- `Makefile` - PROJECT_NAME variable
- `ops/docker/docker-compose.yml` - All service configurations
- `ops/docker/traefik/traefik.yml` - Network configuration
- `.env` - Project name reference (if created)

Backup files:
- `Makefile.bak`
- `ops/docker/docker-compose.yml.bak`
- `ops/docker/traefik/traefik.yml.bak`
