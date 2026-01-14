.PHONY: help start stop restart logs shell-be shell-fe test test-be test-fe lint lint-fix codegen

MODULE_NAME := user-app
COMPOSE_FILE := ops/docker-compose.yml

help:
	@echo "User App Module Commands"
	@echo "========================"
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

# Development shells
shell-be:
	docker exec -it testproject_user_app_backend sh

shell-fe:
	docker exec -it testproject_user_app_frontend sh

# Testing
test: test-be test-fe

test-be:
	docker exec testproject_user_app_backend pnpm test

test-fe:
	docker exec testproject_user_app_frontend pnpm test

# Linting
lint:
	docker exec testproject_user_app_backend pnpm lint
	docker exec testproject_user_app_frontend pnpm lint

lint-fix:
	docker exec testproject_user_app_backend pnpm lint:fix
	docker exec testproject_user_app_frontend pnpm lint:fix

# Code generation from OpenAPI spec
codegen:
	@echo "Generating types from OpenAPI spec..."
	@cd specs && npx openapi-typescript openapi.yaml -o ../backend/src/shared/types/api-types.ts
