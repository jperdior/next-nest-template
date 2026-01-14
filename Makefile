.PHONY: help init start stop restart logs logs-be logs-fe shell-be shell-fe test test-be test-fe lint lint-fix codegen spec-validate db-migrate db-migrate-create db-push db-studio db-seed clean

# Project name - must be set via 'make init'
PROJECT_NAME = testproject

# Docker Compose file location
COMPOSE_FILE := ops/docker/docker-compose.yml

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

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
	echo "📝 Creating backups..."; \
	cp Makefile Makefile.bak; \
	cp ops/docker/docker-compose.yml ops/docker/docker-compose.yml.bak; \
	cp ops/docker/traefik/traefik.yml ops/docker/traefik/traefik.yml.bak; \
	cp package.json package.json.bak; \
	cp backend/src/main.ts backend/src/main.ts.bak; \
	cp frontend/src/app/layout.tsx frontend/src/app/layout.tsx.bak; \
	cp frontend/src/app/page.tsx frontend/src/app/page.tsx.bak; \
	cp backend/TESTING.md backend/TESTING.md.bak; \
	echo ""; \
	echo "🔧 Updating configuration files..."; \
	project_name_cap=$$(echo $$project_name | awk 'BEGIN{FS="-";ORS=""}{for(i=1;i<=NF;i++){$$i=toupper(substr($$i,1,1)) substr($$i,2); if(i<NF)$$i=$$i" "}print $$i}END{print "\n"}}'); \
	sed -i.tmp "s/^PROJECT_NAME =.*/PROJECT_NAME = $$project_name/" Makefile && rm Makefile.tmp; \
	sed -i.tmp "s/dungeonman/$$project_name/g" ops/docker/docker-compose.yml && rm ops/docker/docker-compose.yml.tmp; \
	sed -i.tmp "s/testproject/$$project_name/g" ops/docker/docker-compose.yml && rm ops/docker/docker-compose.yml.tmp; \
	sed -i.tmp "s/dungeonman/$$project_name/g" ops/docker/traefik/traefik.yml && rm ops/docker/traefik/traefik.yml.tmp; \
	sed -i.tmp "s/testproject/$$project_name/g" ops/docker/traefik/traefik.yml && rm ops/docker/traefik/traefik.yml.tmp; \
	sed -i.tmp 's/"name": "testproject"/"name": "'"$$project_name"'"/' package.json && rm package.json.tmp; \
	sed -i.tmp "s/testproject/$$project_name/g" backend/TESTING.md && rm backend/TESTING.md.tmp; \
	sed -i.tmp "s/TestProject/$$project_name_cap/g" backend/src/main.ts && rm backend/src/main.ts.tmp; \
	sed -i.tmp "s/TestProject/$$project_name_cap/g" frontend/src/app/layout.tsx && rm frontend/src/app/layout.tsx.tmp; \
	sed -i.tmp "s/TestProject/$$project_name_cap/g" frontend/src/app/page.tsx && rm frontend/src/app/page.tsx.tmp; \
	echo "PROJECT_NAME=$$project_name" > .env; \
	echo ""; \
	echo "🌐 Configuring hosts file..."; \
	OS_TYPE=$$(uname -s 2>/dev/null || echo "Unknown"); \
	if [ "$$OS_TYPE" = "Darwin" ] || [ "$$OS_TYPE" = "Linux" ]; then \
		HOSTS_FILE="/etc/hosts"; \
		HOSTS_ENTRY="127.0.0.1 backend.$$project_name frontend.$$project_name traefik.$$project_name rabbitmq.$$project_name"; \
		if grep -q "backend.$$project_name" $$HOSTS_FILE 2>/dev/null; then \
			echo "   ℹ️  Hosts entries already exist, skipping..."; \
		else \
			echo "   📝 Adding entries to $$HOSTS_FILE"; \
			echo "   ⚠️  This requires sudo access..."; \
			if echo "$$HOSTS_ENTRY" | sudo tee -a $$HOSTS_FILE > /dev/null 2>&1; then \
				echo "   ✅ Hosts file updated successfully!"; \
			else \
				echo "   ⚠️  Could not update hosts file automatically."; \
				echo "   Please add manually: $$HOSTS_ENTRY"; \
			fi; \
		fi; \
	elif [ "$$OS_TYPE" = "MINGW"* ] || [ "$$OS_TYPE" = "MSYS"* ] || [ "$$OS_TYPE" = "CYGWIN"* ]; then \
		HOSTS_FILE="/c/Windows/System32/drivers/etc/hosts"; \
		HOSTS_ENTRY="127.0.0.1 backend.$$project_name frontend.$$project_name traefik.$$project_name rabbitmq.$$project_name"; \
		if grep -q "backend.$$project_name" $$HOSTS_FILE 2>/dev/null; then \
			echo "   ℹ️  Hosts entries already exist, skipping..."; \
		else \
			echo "   📝 Adding entries to hosts file"; \
			echo "   ⚠️  This requires administrator access..."; \
			echo "   Please run your terminal as Administrator and re-run make init"; \
			echo "   Or manually add: $$HOSTS_ENTRY"; \
		fi; \
	else \
		echo "   ⚠️  Could not detect OS type. Please manually add to hosts file:"; \
		echo "   127.0.0.1 backend.$$project_name frontend.$$project_name traefik.$$project_name rabbitmq.$$project_name"; \
	fi; \
	echo ""; \
	echo "✅ Project initialized as '$$project_name'!"; \
	echo ""; \
	echo "📋 Access URLs:"; \
	echo "   Frontend:  http://frontend.$$project_name:8082 or http://localhost:8080"; \
	echo "   Backend:   http://backend.$$project_name:8082 or http://localhost:8081"; \
	echo "   Traefik:   http://traefik.$$project_name:8082 or http://localhost:8083"; \
	echo "   RabbitMQ:  http://rabbitmq.$$project_name:8082 or http://localhost:15672"; \
	echo ""; \
	echo "🚀 Next step: Start the services"; \
	echo "   make start"; \
	echo ""

start: ## Start all Docker services
	@if [ -z "$(PROJECT_NAME)" ]; then \
		echo "❌ Error: Project not initialized!"; \
		echo ""; \
		echo "Please run 'make init' first to set up your project."; \
		echo ""; \
		exit 1; \
	fi
	@if [ "$(PROJECT_NAME)" = "testproject" ]; then \
		echo "⚠️  Warning: Using default template project name 'testproject'"; \
		echo ""; \
		echo "This appears to be an uninitialized template."; \
		echo "It's recommended to run 'make init' to set a custom project name."; \
		echo ""; \
		read -p "Continue with 'testproject' anyway? (y/N): " confirm; \
		if [ "$$confirm" != "y" ] && [ "$$confirm" != "Y" ]; then \
			echo ""; \
			echo "Run 'make init' to initialize your project with a custom name."; \
			exit 1; \
		fi; \
		echo ""; \
	fi
	@echo "Starting all services..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d
	@echo "Services started! Access:"
	@echo "  Frontend:  http://frontend.$(PROJECT_NAME):8082 or http://localhost:8080"
	@echo "  Backend:   http://backend.$(PROJECT_NAME):8082 or http://localhost:8081"
	@echo "  Traefik:   http://traefik.$(PROJECT_NAME):8082 or http://localhost:8083"
	@echo "  RabbitMQ:  http://rabbitmq.$(PROJECT_NAME):8082 or http://localhost:15672 (guest/guest)"

stop: ## Stop all services
	@echo "Stopping all services..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down

restart: ## Restart all services
	@echo "Restarting all services..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart

logs: ## Tail logs from all services
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f

logs-be: ## Tail backend logs only
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f backend

logs-fe: ## Tail frontend logs only
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f frontend

shell-be: ## Open shell in backend container
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend sh

shell-fe: ## Open shell in frontend container
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec frontend sh

test: ## Run all tests (backend + frontend)
	@echo "Running backend tests..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm test
	@echo "Running frontend tests..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec frontend pnpm test

test-be: ## Run backend tests
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm test

test-fe: ## Run frontend tests
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec frontend pnpm test

lint: ## Lint all code
	@echo "Linting backend..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm lint
	@echo "Linting frontend..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec frontend pnpm lint

lint-fix: ## Auto-fix linting issues
	@echo "Auto-fixing backend linting..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm lint:fix
	@echo "Auto-fixing frontend linting..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec frontend pnpm lint:fix

codegen: ## Generate shared types from OpenAPI spec
	@echo "Generating shared types from OpenAPI specification..."
	@if [ ! -f "specs/openapi.yaml" ]; then \
		echo "❌ Error: specs/openapi.yaml not found!"; \
		echo "   Please create the OpenAPI specification first."; \
		exit 1; \
	fi
	@echo "📝 Running openapi-typescript..."
	pnpm openapi-typescript specs/openapi.yaml -o packages/api-types/src/generated.ts
	@echo "🔨 Building api-types package..."
	cd packages/api-types && pnpm build
	@echo "✅ Code generation complete!"
	@echo ""
	@echo "Generated types are available at:"
	@echo "  packages/api-types/src/generated.ts"
	@echo ""
	@echo "Import in your code:"
	@echo "  import type { components } from '@testproject/api-types';"

spec-validate: ## Validate OpenAPI specification
	@echo "Validating OpenAPI specification..."
	@if [ ! -f "specs/openapi.yaml" ]; then \
		echo "❌ Error: specs/openapi.yaml not found!"; \
		exit 1; \
	fi
	@pnpm openapi-typescript specs/openapi.yaml --help > /dev/null 2>&1 && \
		echo "✅ OpenAPI spec is valid!" || \
		(echo "❌ OpenAPI spec has errors" && exit 1)

db-migrate: ## Run Prisma migrations
	@echo "Running database migrations..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm prisma migrate deploy

db-migrate-create: ## Create a new Prisma migration (usage: make db-migrate-create name=add_users_table)
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide a migration name. Usage: make db-migrate-create name=add_users_table"; \
		exit 1; \
	fi
	@echo "Creating migration: $(name)"
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm prisma migrate dev --name $(name)

db-push: ## Push schema changes to database (development only)
	@echo "Pushing schema changes..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm prisma db push

db-studio: ## Open Prisma Studio
	@echo "Opening Prisma Studio..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm prisma studio

db-seed: ## Seed the database
	@echo "Seeding database..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm prisma db seed

clean: ## Remove all containers, volumes, and build artifacts
	@echo "Cleaning up..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down -v
	@echo "Removing node_modules and build artifacts..."
	@find . -name "node_modules" -type d -prune -exec rm -rf {} \;
	@find . -name "dist" -type d -prune -exec rm -rf {} \;
	@find . -name ".next" -type d -prune -exec rm -rf {} \;
	@echo "Clean complete!"
