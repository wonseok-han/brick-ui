PNPM ?= pnpm

.DEFAULT_GOAL := help

.PHONY: help install dev docs storybook build start

help:
	@echo "brick-ui local commands"
	@echo ""
	@echo "  make install    Install workspace dependencies"
	@echo "  make dev        Run all development tasks with Turborepo"
	@echo "  make docs       Run the docs server at http://localhost:3100"
	@echo "  make storybook  Run Storybook at http://localhost:6006"
	@echo "  make build      Build the entire workspace"
	@echo "  make start      Build and run the production docs server"

install:
	$(PNPM) install

dev:
	$(PNPM) dev

docs:
	$(PNPM) --filter @brick/docs dev

storybook:
	$(PNPM) --filter @brick/storybook dev

build:
	$(PNPM) build

start: build
	$(PNPM) --filter @brick/docs start
