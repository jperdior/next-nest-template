.PHONY: help init start start-infra stop stop-infra restart logs clean \
        start-user-app stop-user-app logs-user-app shell-user-app-be shell-user-app-fe test-user-app \
        start-backoffice stop-backoffice logs-backoffice shell-backoffice-be shell-backoffice-fe test-backoffice \
        test test-all lint lint-fix db-migrate db-migrate-create db-push db-studio db-seed codegen

# Project Configuration
PROJECT_NAME := testproject

help: ## Show this help message
	@echo "Dungeonman - Module-Based Monorepo"
	@echo "==================================="
	@echo ""
	@echo "Initialization:"
	@echo "  make init              - Initialize project with custom name (optional)"
	@echo "  make setup-hosts       - Add local development domains to /etc/hosts"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make start-infra       - Start shared infrastructure (Postgres, Redis, RabbitMQ, Traefik)"
	@echo "  make stop-infra        - Stop shared infrastructure"
	@echo ""
	@echo "All Services:"
	@echo "  make start             - Start infrastructure + all modules"
	@echo "  make stop              - Stop all services"
	@echo "  make restart           - Restart all services"
	@echo "  make logs              - View all logs"
	@echo "  make clean             - Stop and remove all containers and volumes"
	@echo ""
	@echo "User App Module:"
	@echo "  make start-user-app    - Start user-app module"
	@echo "  make stop-user-app     - Stop user-app module"
	@echo "  make logs-user-app     - View user-app logs"
	@echo "  make shell-user-app-be - Shell into user-app backend"
	@echo "  make shell-user-app-fe - Shell into user-app frontend"
	@echo "  make test-user-app     - Test user-app module"
	@echo ""
	@echo "Backoffice Module:"
	@echo "  make start-backoffice  - Start backoffice module"
	@echo "  make stop-backoffice   - Stop backoffice module"
	@echo "  make logs-backoffice   - View backoffice logs"
	@echo "  make shell-backoffice-be - Shell into backoffice backend"
	@echo "  make shell-backoffice-fe - Shell into backoffice frontend"
	@echo "  make test-backoffice   - Test backoffice module"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test              - Run tests for all modules"
	@echo "  make lint              - Lint all code"
	@echo "  make lint-fix          - Auto-fix linting issues"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate        - Apply database migrations"
	@echo "  make db-migrate-create name=<name> - Create new migration"
	@echo "  make db-push           - Push schema changes (dev only)"
	@echo "  make db-studio         - Open Prisma Studio"
	@echo "  make db-seed           - Seed database"
	@echo ""
	@echo "Code Generation:"
	@echo "  make codegen           - Generate types from OpenAPI specs (all modules)"

# ============================================================================
# Initialization
# ============================================================================

init: ## Initialize project with custom name
	@if [ -n "$(PROJECT_NAME)" ] && [ "$(PROJECT_NAME)" != "testproject" ]; then \
		echo "⚠️  Project already initialized as '$(PROJECT_NAME)'"; \
		read -p "Do you want to reinitialize? (y/N): " confirm; \
		if [ "$$confirm" != "y" ] && [ "$$confirm" != "Y" ]; then \
			echo "Initialization cancelled."; \
			exit 0; \
		fi; \
	fi; \
	echo "🚀 Project Initialization"; \
	echo "========================"; \
	echo ""; \
	read -p "Enter project name (lowercase, alphanumeric, hyphens only): " project_name; \
	if [ -z "$$project_name" ]; then \
		echo "❌ Error: Project name cannot be empty"; \
		exit 1; \
	fi; \
	if ! echo "$$project_name" | grep -qE '^[a-z0-9][a-z0-9-]*[a-z0-9]$$|^[a-z0-9]$$'; then \
		echo "❌ Error: Invalid project name. Use lowercase letters, numbers, and hyphens only."; \
		echo "   Must start and end with alphanumeric character."; \
		exit 1; \
	fi; \
	echo ""; \
	echo "📝 Updating configuration files..."; \
	sed -i.bak "s/^PROJECT_NAME :=.*/PROJECT_NAME := $$project_name/" Makefile && rm Makefile.bak; \
	sed -i.bak "s/testproject_/$$project_name""_/g" infra/docker-compose.yml && rm infra/docker-compose.yml.bak; \
	sed -i.bak "s/testproject_/$$project_name""_/g" infra/traefik.yml && rm infra/traefik.yml.bak; \
	sed -i.bak "s/testproject_/$$project_name""_/g" modules/user-app/ops/docker-compose.yml && rm modules/user-app/ops/docker-compose.yml.bak; \
	sed -i.bak "s/testproject_/$$project_name""_/g" modules/backoffice/ops/docker-compose.yml && rm modules/backoffice/ops/docker-compose.yml.bak; \
	sed -i.bak 's/"name": "testproject"/"name": "'"$$project_name"'"/' package.json && rm package.json.bak; \
	echo ""; \
	echo "✅ Project initialized as '$$project_name'!"; \
	echo ""; \
	echo "📋 Access URLs:"; \
	echo "   User App Frontend:     http://localhost:3000 or http://user.local:8080"; \
	echo "   User App Backend:      http://localhost:3001 or http://api.user.local:8080"; \
	echo "   Backoffice Frontend:   http://localhost:3010 or http://admin.local:8080"; \
	echo "   Backoffice Backend:    http://localhost:3011 or http://api.admin.local:8080"; \
	echo "   Traefik Dashboard:     http://localhost:8081"; \
	echo "   RabbitMQ Management:   http://localhost:15672"; \
	echo ""; \
	echo "🚀 Next steps:"; \
	echo "   1. Install dependencies: pnpm install"; \
	echo "   2. Generate Prisma client: cd shared/database && pnpm generate"; \
	echo "   3. Start services: make start";

# ============================================================================
# Infrastructure Management
# ============================================================================

start-infra: ## Start shared infrastructure services
	@echo "🚀 Starting shared infrastructure..."
	docker compose -f infra/docker-compose.yml up -d
	@echo "✅ Infrastructure started!"
	@echo ""
	@echo "Services:"
	@echo "  PostgreSQL:  localhost:5432"
	@echo "  Redis:       localhost:6379"
	@echo "  RabbitMQ:    localhost:5672 (management: localhost:15672)"
	@echo "  Traefik:     localhost:8080 (dashboard: localhost:8081)"

stop-infra: ## Stop shared infrastructure
	@echo "Stopping shared infrastructure..."
	docker compose -f infra/docker-compose.yml down

# ============================================================================
# All Services Management
# ============================================================================

start: setup-hosts ## Start all services (infrastructure + all modules)
	@echo ""
	@echo "🚀 Starting all services (infrastructure + modules)..."
	docker compose -f ops/docker-compose.yml up -d
	@echo ""
	@echo "✅ All services started!"
	@echo ""
	@echo "📍 Access URLs:"
	@echo "  Direct ports:"
	@FOUND_MODULES=$$(find modules/*/ops -name "docker-compose.yml" 2>/dev/null | wc -l | tr -d ' '); \
	if [ "$$FOUND_MODULES" -gt 0 ]; then \
		grep -h "ports:" modules/*/ops/docker-compose.yml 2>/dev/null | \
		grep -o '"[0-9]*:[0-9]*"' | tr -d '"' | sort -u | \
		sed 's/^/    http:\/\/localhost:/; s/:.*//'; \
	fi
	@echo ""
	@echo "  Via Traefik (prettier URLs):"
	@DOMAINS=$$(find modules/*/ops -name "docker-compose.yml" -exec grep -h "Host(" {} \; 2>/dev/null | \
		sed -n "s/.*Host(\`\([^']*\)\`).*/\1/p" | sort -u); \
	echo "$$DOMAINS" | while read domain; do echo "    http://$$domain:8080"; done
	@echo ""
	@echo "  Management:"
	@echo "    http://localhost:8081 - Traefik Dashboard"
	@echo "    http://localhost:15672 - RabbitMQ Management"

stop: ## Stop all services
	@echo "Stopping all services..."
	docker compose -f ops/docker-compose.yml down --remove-orphans
	@# Also clean up any leftover containers from previous runs
	@docker ps -a --filter "name=$(PROJECT_NAME)_" -q | xargs -r docker rm -f 2>/dev/null || true
	@docker network ls --filter "name=$(PROJECT_NAME)" -q | xargs -r docker network rm 2>/dev/null || true

restart: stop start ## Restart all services

logs: ## View logs from all services
	docker compose -f ops/docker-compose.yml logs -f

clean: ## Remove all containers and volumes
	@echo "⚠️  This will remove all containers and volumes (data will be lost)!"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker compose -f ops/docker-compose.yml down -v --remove-orphans; \
		docker ps -a --filter "name=$(PROJECT_NAME)_" -q | xargs -r docker rm -f 2>/dev/null || true; \
		docker network ls --filter "name=$(PROJECT_NAME)" -q | xargs -r docker network rm 2>/dev/null || true; \
		docker volume ls --filter "name=$(PROJECT_NAME)" -q | xargs -r docker volume rm 2>/dev/null || true; \
		echo "✅ Cleaned up!"; \
	else \
		echo "Cancelled."; \
	fi

setup-hosts: ## Add local development domains to /etc/hosts
	@echo "🔍 Scanning for Traefik domains in module configurations..."
	@echo ""
	@DOMAINS=$$(find modules/*/ops -name "docker-compose.yml" -exec grep -h "Host(" {} \; 2>/dev/null | \
		sed -n "s/.*Host(\`\([^']*\)\`).*/\1/p" | sort -u); \
	if [ -z "$$DOMAINS" ]; then \
		echo "⚠️  No Traefik domains found in module configurations"; \
		exit 0; \
	fi; \
	echo "📋 Found domains:"; \
	echo "$$DOMAINS" | sed 's/^/   - /'; \
	echo ""; \
	echo "Adding to /etc/hosts..."; \
	for domain in $$DOMAINS; do \
		if grep -q "^127.0.0.1[[:space:]].*$$domain" /etc/hosts 2>/dev/null; then \
			echo "✓ $$domain already exists"; \
		else \
			echo "Adding $$domain..."; \
			echo "127.0.0.1 $$domain" | sudo tee -a /etc/hosts > /dev/null; \
		fi; \
	done; \
	echo ""; \
	echo "✅ Local domains configured!"; \
	echo ""; \
	echo "📍 Access URLs (via Traefik on :8080):"; \
	echo "$$DOMAINS" | while read domain; do echo "   http://$$domain:8080"; done

# ============================================================================
# User App Module
# ============================================================================

start-user-app: ## Start user-app module (requires infrastructure to be running)
	@$(MAKE) -C modules/user-app start

stop-user-app: ## Stop user-app module
	@$(MAKE) -C modules/user-app stop

logs-user-app: ## View user-app logs
	@$(MAKE) -C modules/user-app logs

shell-user-app-be: ## Open shell in user-app backend
	@$(MAKE) -C modules/user-app shell-be

shell-user-app-fe: ## Open shell in user-app frontend
	@$(MAKE) -C modules/user-app shell-fe

test-user-app: ## Run tests for user-app
	@$(MAKE) -C modules/user-app test

# ============================================================================
# Backoffice Module
# ============================================================================

start-backoffice: ## Start backoffice module (requires infrastructure to be running)
	@$(MAKE) -C modules/backoffice start

stop-backoffice: ## Stop backoffice module
	@$(MAKE) -C modules/backoffice stop

logs-backoffice: ## View backoffice logs
	@$(MAKE) -C modules/backoffice logs

shell-backoffice-be: ## Open shell in backoffice backend
	@$(MAKE) -C modules/backoffice shell-be

shell-backoffice-fe: ## Open shell in backoffice frontend
	@$(MAKE) -C modules/backoffice shell-fe

test-backoffice: ## Run tests for backoffice
	@$(MAKE) -C modules/backoffice test

# ============================================================================
# Testing & Quality
# ============================================================================

test: test-user-app test-backoffice ## Run tests for all modules

lint: ## Lint all code
	@echo "Linting all modules..."
	@$(MAKE) -C modules/user-app lint
	@$(MAKE) -C modules/backoffice lint

lint-fix: ## Auto-fix linting issues
	@echo "Auto-fixing linting issues..."
	@$(MAKE) -C modules/user-app lint-fix
	@$(MAKE) -C modules/backoffice lint-fix

# ============================================================================
# Database Management (Context-Specific)
# ============================================================================

db-migrate-create: ## Create migration (usage: make db-migrate-create name=add_field)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: name parameter is required"; \
		echo "Usage: make db-migrate-create name=add_field"; \
		exit 1; \
	fi
	@echo "Creating migration: $(name)..."
	docker exec testproject_user_app_backend sh -c \
	  "cd /app/shared/contexts/Infrastructure/persistence && \
	   pnpm prisma migrate dev --name $(name)"

db-migrate-deploy: ## Apply all migrations
	@echo "Applying migrations..."
	docker exec testproject_user_app_backend sh -c \
	  "cd /app/shared/contexts/Infrastructure/persistence && \
	   pnpm prisma migrate deploy"

db-generate: ## Generate Prisma client
	@echo "Generating Prisma client..."
	docker exec testproject_user_app_backend sh -c \
	  "cd /app/shared/contexts/Infrastructure/persistence && \
	   pnpm prisma generate"

db-studio: ## Open Prisma Studio
	@echo "Opening Prisma Studio on http://localhost:5555..."
	docker exec testproject_user_app_backend sh -c \
	  "cd /app/shared/contexts/Infrastructure/persistence && \
	   pnpm prisma studio"

# Legacy database commands (deprecated)
db-migrate: ## [DEPRECATED] Apply database migrations (use db-migrate-deploy instead)
	@echo "⚠️  WARNING: This command is deprecated. Use 'make db-migrate-deploy' instead."
	@$(MAKE) db-migrate-deploy

db-push: ## [DEPRECATED] Push schema changes (use db-migrate-create instead)
	@echo "⚠️  WARNING: This command is deprecated. Use 'make db-migrate-create name=<migration_name>' instead."

db-seed: ## Seed the database (implementation needed)
	@echo "⚠️  Database seeding should be implemented"

# ============================================================================
# Code Generation
# ============================================================================

codegen: ## Generate types from OpenAPI specs for all modules
	@echo "Generating types from OpenAPI specs..."
	@$(MAKE) -C modules/user-app codegen
	@$(MAKE) -C modules/backoffice codegen
	@echo "✅ Code generation complete!"
