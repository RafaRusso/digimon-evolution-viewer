.PHONY: help install dev build clean test lint deploy

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Mostrar ajuda
	@echo "$(BLUE)Comandos disponíveis:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Instalar dependências
	@echo "$(BLUE)Instalando dependências...$(NC)"
	cd digimon-api && npm install
	cd digimon-frontend && npm install

dev: ## Executar em modo desenvolvimento
	@echo "$(BLUE)Iniciando desenvolvimento...$(NC)"
	./scripts/build.sh dev

build: ## Build para produção
	@echo "$(BLUE)Building para produção...$(NC)"
	./scripts/build.sh prod

clean: ## Limpar containers e imagens
	@echo "$(YELLOW)Limpando containers...$(NC)"
	docker-compose down -v
	docker system prune -f

test: ## Executar testes
	@echo "$(BLUE)Executando testes...$(NC)"
	cd digimon-api && npm test || true
	cd digimon-frontend && npm test || true

lint: ## Executar linting
	@echo "$(BLUE)Executando linting...$(NC)"
	cd digimon-api && npm run lint || true
	cd digimon-frontend && npm run lint || true

deploy-prep: ## Preparar para deploy
	@echo "$(BLUE)Preparando para deploy...$(NC)"
	./scripts/deploy-render.sh

verify: ## Verificar deploy
	@echo "$(BLUE)Verificando deploy...$(NC)"
	./scripts/verify-deploy.sh

logs: ## Ver logs dos containers
	docker-compose logs -f

status: ## Ver status dos containers
	docker-compose ps

restart: ## Reiniciar containers
	docker-compose restart

shell-api: ## Entrar no container da API
	docker-compose exec api sh

shell-frontend: ## Entrar no container do frontend
	docker-compose exec frontend sh
