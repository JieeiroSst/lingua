.DEFAULT_GOAL := help

.PHONY: help install dev build test preview check

help:
	@printf '%s\n' \
		'install  Install dependencies' \
		'dev      Start the Vite development server' \
		'build    Create a production build' \
		'test     Run tests' \
		'preview  Build and preview the production app' \
		'check    Run tests and build'

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

preview: build
	npm run preview

check: test build
