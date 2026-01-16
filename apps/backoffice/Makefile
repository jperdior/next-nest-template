.PHONY: help start stop restart logs shell-be shell-fe test test-be test-fe lint lint-fix codegen check-containers

MODULE_NAME := backoffice
COMPOSE_FILE := ops/docker-compose.yml
BACKEND_CONTAINER := testproject_backoffice_backend
FRONTEND_CONTAINER := testproject_backoffice_frontend

help:
	@echo "Backoffice Module Commands"
	@echo "=========================="
	@echo ""
	@echo "Module Lifecycle:"
	@echo "  make start         - Start this module (requires infra to be running)"
	@echo "  make stop          - Stop this module"
	@echo "  make restart       - Restart this module"
	@echo "  make logs          - View logs"
	@echo ""
	@echo "Development:"
	@echo "  make shell-be      - Open shell in backend container"
	@echo "  make shell-fe      - Open shell in frontend container"
	@echo ""
	@echo "Testing & Linting:"
	@echo "  make test          - Run all tests (backend + frontend)"
	@echo "  make test-be       - Run backend tests"
	@echo "  make test-fe       - Run frontend tests"
	@echo "  make lint          - Lint code"
	@echo "  make lint-fix      - Auto-fix linting issues"
	@echo ""
	@echo "Code Generation:"
	@echo "  make codegen       - Generate types from OpenAPI spec"

# Module lifecycle
start:
	@echo "Starting $(MODULE_NAME) module..."
	docker compose -f $(COMPOSE_FILE) up -d

stop:
	@echo "Stopping $(MODULE_NAME) module..."
	docker compose -f $(COMPOSE_FILE) down

restart: stop start

logs:
	docker compose -f $(COMPOSE_FILE) logs -f

# Container status check helper
check-containers:
	@if ! docker ps --format '{{.Names}}' | grep -q '^$(BACKEND_CONTAINER)$$' || \
	    ! docker ps --format '{{.Names}}' | grep -q '^$(FRONTEND_CONTAINER)$$'; then \
		echo ""; \
		echo "❌ Error: Containers are not running"; \
		echo ""; \
		echo "The $(MODULE_NAME) module containers must be running to execute this command."; \
		echo ""; \
		echo "Please start the containers first:"; \
		echo "  make start              # Start this module only"; \
		echo "  cd ../.. && make start  # Start all services"; \
		echo ""; \
		exit 1; \
	fi

# Development shells
shell-be:
	docker exec -it testproject_backoffice_backend sh

shell-fe:
	docker exec -it testproject_backoffice_frontend sh

# Testing
test: test-be test-fe

test-be: check-containers
	docker exec $(BACKEND_CONTAINER) pnpm test

test-fe: check-containers
	docker exec $(FRONTEND_CONTAINER) pnpm test

# Linting
lint: check-containers
	docker exec $(BACKEND_CONTAINER) pnpm lint
	docker exec $(FRONTEND_CONTAINER) pnpm lint

lint-fix: check-containers
	docker exec $(BACKEND_CONTAINER) pnpm lint:fix
	docker exec $(FRONTEND_CONTAINER) pnpm lint:fix

# Code generation from OpenAPI spec (uses backend container which has full project mounted)
codegen: check-containers
	@echo "Generating types from OpenAPI spec..."
	docker exec $(BACKEND_CONTAINER) sh -c "cd /app && pnpm exec openapi-typescript apps/backoffice/specs/openapi.yaml -o apps/backoffice/backend/src/shared/types/api-types.ts"
	docker exec $(BACKEND_CONTAINER) sh -c "cd /app && pnpm exec openapi-typescript apps/backoffice/specs/openapi.yaml -o apps/backoffice/frontend/src/shared/types/generated-api-types.ts"
