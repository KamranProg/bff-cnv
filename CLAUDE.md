# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

# CI Error Guidelines

If the user wants help with fixing an error in their CI pipeline, use the following flow:

- Retrieve the list of current CI Pipeline Executions (CIPEs) using the `nx_cloud_cipe_details` tool
- If there are any errors, use the `nx_cloud_fix_cipe_failure` tool to retrieve the logs for a specific task
- Use the task logs to see what's wrong and help the user fix their problem. Use the appropriate tools if necessary
- Make sure that the problem is fixed by running the task that you passed into the `nx_cloud_fix_cipe_failure` tool

<!-- nx configuration end-->

# Architecture Overview

This is an Nx monorepo implementing a Backend-For-Frontend (BFF) pattern with Angular, Express, and Convex. The architecture separates concerns into three main layers:

## Projects Structure

**Applications:**

- `ng-frontend` - Angular 20 application (standalone components)
- `ng-bff` - Express-based Backend-For-Frontend server (Node.js)
- `ng-frontend-e2e` - Playwright E2E tests

**Libraries:**

- `shared-types` - Shared TypeScript types/DTOs used across frontend and backend
- `convex` - Convex backend functions, schema, and configuration

## Authentication Flow

The app uses **WorkOS AuthKit** for authentication with a sealed session pattern:

1. User initiates login via `/auth/login` (redirects to WorkOS AuthKit)
2. WorkOS callback returns to `/auth/callback` with authorization code
3. BFF exchanges code for sealed session, stores in `wos-session` cookie
4. BFF issues CSRF token in `X-CSRF-Token` cookie
5. For Convex operations, BFF mints a JWT (signed with RSA key pair) and returns it to the frontend
6. Frontend uses the JWT to authenticate directly with Convex (JWT validated via JWKS endpoint at `/.well-known/jwks.json`)

**Key files:**

- `apps/ng-bff/src/app/workos.ts` - WorkOS SDK initialization and session loading
- `apps/ng-bff/src/app/jwt.ts` - JWT minting and JWKS endpoint for Convex
- `apps/ng-bff/src/app/csrf.ts` - CSRF token generation and validation
- `apps/ng-bff/src/app/routes.ts` - All BFF API routes
- `libs/convex/src/lib/auth.config.ts` - Convex JWT validation config

## Development Workflow

The frontend and BFF run concurrently in development:

```bash
# Run both frontend and BFF together (recommended for development)
pnpm dev

# Or run individually:
pnpm dev:frontend  # Angular dev server on :4200
pnpm dev:bff       # Express BFF on :3000

# Convex dev server (in separate terminal):
nx run convex:dev
```

**Important:** The Angular dev server uses `proxy.conf.json` to proxy `/api`, `/auth`, and `/.well-known` requests to the BFF at `localhost:3000`.

## Common Commands

```bash
# Development
pnpm dev                    # Run frontend + BFF in parallel
nx serve ng-frontend        # Run Angular frontend only
nx serve ng-bff             # Run BFF only
nx run convex:dev           # Run Convex dev server

# Building
nx build ng-frontend        # Build Angular app
nx build ng-bff             # Build BFF (outputs to dist/apps/ng-bff)
nx build shared-types       # Build shared types library

# Code Quality
pnpm format                 # Format changed files with Prettier
pnpm format:check           # Check formatting without writing
pnpm lint                   # Run ESLint on all projects
pnpm typecheck              # Run TypeScript type checking on all projects
pnpm test                   # Run Jest tests on all projects
pnpm verify                 # Run all checks: format, lint, typecheck, test

# Running specific project tasks
nx lint ng-frontend         # Lint specific project
nx test ng-bff              # Test specific project
nx typecheck ng-frontend    # Typecheck specific project

# E2E Testing
nx e2e ng-frontend-e2e      # Run Playwright E2E tests

# Convex
nx run convex:deploy        # Deploy Convex functions
nx run convex:functions:check  # Type-check Convex functions

# Utilities
nx reset                    # Clear Nx cache
pnpm clean                  # Remove all build artifacts and cache
```

## Key Configuration Files

- `.env.local` - Local environment variables (not committed; contains CONVEX_DEPLOYMENT, CONVEX_URL, etc.)
- `proxy.conf.json` - Angular dev server proxy configuration for BFF routes
- `libs/convex/src/lib/schema.ts` - Convex database schema
- `libs/convex/src/lib/auth.config.ts` - Convex JWT authentication configuration

## Angular Best Practices

This project uses Angular 20 with modern conventions:

- **Standalone components** (no NgModules)
- **Typed reactive forms** (prefer FormControl/FormGroup)
- **Modern control flow** (`@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`)
- **Signals** for reactive state management where appropriate

Use the Angular MCP server tools (`search_documentation`, `get_best_practices`) when working with Angular code to ensure adherence to current best practices.

## WorkOS Configuration

The BFF requires these environment variables (set in `.env.local` or environment):

- `WORKOS_API_KEY` - WorkOS API key
- `WORKOS_CLIENT_ID` - WorkOS client ID
- `WORKOS_COOKIE_PASSWORD` - 32-byte secret for sealed session encryption
- `BFF_PUBLIC_URL` - Public URL of BFF (for devtunnel or production)
- `APP_URL` - Frontend URL (default: http://localhost:4200)

**Devtunnel setup:** The BFF uses a devtunnel URL (`BFF_PUBLIC_URL`) as the OIDC issuer so Convex can reach the JWKS endpoint. This allows the BFF to run on localhost while Convex validates JWTs via the public JWKS URL.

## Convex Integration

Convex functions are in `libs/convex/src/lib/`:

- `messages.ts` - Example queries/mutations
- `users.ts` - User-related operations
- `schema.ts` - Database schema definition
- `auth.config.ts` - JWT authentication configuration

The BFF mints JWTs with the subject claim set to the WorkOS user ID. Convex validates these JWTs using the JWKS endpoint exposed by the BFF.

## Security Notes

- CSRF protection is enforced on state-changing BFF routes (POST/PUT/DELETE)
- Cookies use `Secure` and `SameSite=Lax` in production (configurable)
- JWT signing uses RSA-256 with auto-generated key pairs
- WorkOS sealed sessions provide secure, encrypted session storage
- Do not store secrets in code or commit `.env.local` to version control
