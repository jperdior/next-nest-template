.PHONY: help init start stop restart logs logs-be logs-fe shell-be shell-fe test test-be test-fe lint db-migrate db-migrate-create db-push db-studio db-seed clean

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
	@if [ -n "$(PROJECT_NAME)" ]; then \
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
	echo ""; \
	echo "🔧 Updating configuration files..."; \
	sed -i.tmp "s/^PROJECT_NAME =.*/PROJECT_NAME = $$project_name/" Makefile && rm Makefile.tmp; \
	sed -i.tmp "s/dungeonman/$$project_name/g" ops/docker/docker-compose.yml && rm ops/docker/docker-compose.yml.tmp; \
	sed -i.tmp "s/dungeonman/$$project_name/g" ops/docker/traefik/traefik.yml && rm ops/docker/traefik/traefik.yml.tmp; \
	echo "PROJECT_NAME=$$project_name" > .env; \
	echo ""; \
	echo "✅ Project initialized as '$$project_name'!"; \
	echo ""; \
	echo "📋 Next steps:"; \
	echo ""; \
	echo "1️⃣  Add these lines to your /etc/hosts file:"; \
	echo ""; \
	echo "    127.0.0.1 backend.$$project_name frontend.$$project_name traefik.$$project_name rabbitmq.$$project_name"; \
	echo ""; \
	echo "2️⃣  Start the services:"; \
	echo ""; \
	echo "    make start"; \
	echo ""; \
	echo "💡 To edit /etc/hosts on macOS/Linux:"; \
	echo "    sudo nano /etc/hosts"; \
	echo ""

start: ## Start all Docker services
	@if [ -z "$(PROJECT_NAME)" ]; then \
		echo "❌ Error: Project not initialized!"; \
		echo ""; \
		echo "Please run 'make init' first to set up your project."; \
		echo ""; \
		exit 1; \
	fi
	@echo "Starting all services..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d
	@echo "Services started! Access:"
	@echo "  Frontend:  http://frontend.$(PROJECT_NAME)"
	@echo "  Backend:   http://backend.$(PROJECT_NAME)"
	@echo "  Traefik:   http://traefik.$(PROJECT_NAME)"
	@echo "  RabbitMQ:  http://rabbitmq.$(PROJECT_NAME) (guest/guest)"

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
	@cd backend && pnpm test
	@echo "Running frontend tests..."
	@cd frontend && pnpm test

test-be: ## Run backend tests
	@cd backend && pnpm test

test-fe: ## Run frontend tests
	@cd frontend && pnpm test

lint: ## Lint all code
	@echo "Linting backend..."
	@cd backend && pnpm lint
	@echo "Linting frontend..."
	@cd frontend && pnpm lint

db-migrate: ## Run Prisma migrations
	@echo "Running database migrations..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec backend pnpm prisma migrate deploy

db-migrate-create: ## Create a new Prisma migration (usage: make db-migrate-create name=add_users_table)
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide a migration name. Usage: make db-migrate-create name=add_users_table"; \
		exit 1; \
	fi
	@echo "Creating migration: $(name)"
	@cd backend && pnpm prisma migrate dev --name $(name)

db-push: ## Push schema changes to database (development only)
	@echo "Pushing schema changes..."
	@cd backend && pnpm prisma db push

db-studio: ## Open Prisma Studio
	@echo "Opening Prisma Studio..."
	@cd backend && pnpm prisma studio

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
