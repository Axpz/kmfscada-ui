# Makefile for KMF SCADA UI

.PHONY: help dev build docker clean

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development server
	pnpm dev

build: ## Build for production
	pnpm build

clean: ## Clean build artifacts and cache
	rm -rf .next
	rm -rf dist
	rm -rf node_modules/.cache
	rm -f tsconfig.tsbuildinfo

# Docker commands
docker: ## Build Docker image for linux/amd64
	docker build -t kmfscada-ui:latest . 

# Docker commands
docker-build: ## Build Docker image for linux/amd64
	docker build --platform linux/amd64 -t kmfscada-ui-linux-amd64:latest . 