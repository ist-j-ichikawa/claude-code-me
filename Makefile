PREFIX  ?= /usr/local
BIN_DIR  = $(PREFIX)/bin
APP_DIR  = $(PREFIX)/share/claude-code-me

.PHONY: start dev build check install uninstall clean test check-upstream help

start: dist/server.mjs ## Start the production server
	@node dist/server.mjs

dev: check ## Start the development server (HMR)
	@npx vite dev

build: check ## Build for production (client + server)
	@npx vite build
	@npx tsup
	@chmod +x dist/server.mjs
	@echo "Built: dist/server.mjs + dist/client/"

check: ## Check prerequisites
	@command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required (https://nodejs.org)"; exit 1; }
	@NODE_VER=$$(node -e "process.stdout.write(process.versions.node.split('.')[0])"); \
	 if [ "$$NODE_VER" -lt 18 ] 2>/dev/null; then echo "Error: Node.js 18+ required (found v$$(node -v))"; exit 1; fi
	@test -d "$$HOME/.claude" || { echo "Error: ~/.claude/ not found. Run Claude Code first."; exit 1; }

dist/server.mjs: src/server/*.ts
	@$(MAKE) build

install: build ## Install to $(PREFIX)/bin/ccme
	@mkdir -p $(BIN_DIR) $(APP_DIR)
	@cp dist/server.mjs $(APP_DIR)/
	@cp -r dist/client $(APP_DIR)/
	@ln -sf $(APP_DIR)/server.mjs $(BIN_DIR)/ccme
	@echo "Installed: $(BIN_DIR)/ccme"

uninstall: ## Remove installed files
	@rm -f $(BIN_DIR)/ccme
	@rm -rf $(APP_DIR)
	@echo "Uninstalled."

test: check ## Run tests
	@npx vitest run test/server/

check-upstream: check ## Check for new Claude Code releases
	@sh scripts/check-upstream.sh

clean: ## Remove build artifacts
	@rm -rf dist/ build/ .svelte-kit/

help: ## Show this help
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | sed 's/:.*## /\t/' | column -t -s '	'
