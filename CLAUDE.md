# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server (requires Docker for PostgreSQL)
- `pnpm build` - Build all packages and apps
- `pnpm build:preview` - Build with preview environment (uses `.env`)
- `pnpm build:production` - Build for production (uses `.env.production`)
- `pnpm lint` - Run Biome linting across all workspaces
- `pnpm typecheck` - Run TypeScript type checking across all workspaces
- `pnpm format` - Format code using Biome
- `pnpm check` - Run Biome check with auto-fix

## Database Commands

- `pnpm db:push` - Push schema changes to database (force)
- `pnpm db:migrate-generate` - Generate migration files
- `pnpm db:migrate-push` - Apply migrations to database
- `pnpm db:studio` - Open Drizzle Studio for database management

## Testing

Run individual package tests with:

```bash
pnpm run --filter <package-name> test
```

## Environment Management

Environment variables are encrypted using dotenvx:

- `.env.production` - Production builds
- `.env` - Local development and preview builds  
- `.env.local` - Local-only settings (git-ignored)

Set variables with: `pnpm env:set <VARIABLE_NAME> <VALUE>`
Use `-f` flag to target specific env file: `pnpm env:set <VAR> <VALUE> -f .env.local`

## Architecture Overview

This is a TypeScript monorepo using Turborepo with the following structure:

### Core Packages

- **`packages/api`** - ORPC-based API server with OpenAPI support
  - Uses ArkType for schema validation
  - Authentication via passkeys
  - Todo CRUD operations example
  - Located at `packages/api/src/server.ts`

- **`packages/db`** - Database layer using Drizzle ORM
  - PostgreSQL with snake_case column naming
  - User and credential schemas for authentication
  - Factory function `createDb(connectionString)`

- **`packages/ui`** - Shared UI components
  - Shadcn/ui components
  - Custom chat components
  - Tailwind CSS styling
  - Theme provider for dark/light modes

### Applications

- **`apps/www`** - Main web application
  - TanStack Start (React) frontend
  - Vite build system with HTTPS dev server (port 6969)
  - Authentication routes with passkey support
  - ORPC client integration

### Tooling

- **Biome** - Formatting, linting, and import organization
- **Turborepo** - Monorepo build orchestration with caching
- **pnpm** - Package management with workspaces
- **TypeScript** - Strict configuration with ES2024 target
- **Docker Compose** - PostgreSQL development database

## First-Time Setup

1. Ensure Docker is running
2. `docker compose up -d` (start PostgreSQL)
3. `pnpm db:push` (initialize database schema)
4. `pnpm dev` (start development - may need to accept HTTPS certificates)
5. Visit `https://localhost:6969`

## Package Generation

Create new packages with: `pnpm new:package --args "PACKAGE_NAME" "public"|"private"`
This scaffolds a new package under `packages/` with proper configuration.

## Code Conventions

- React hooks must be at component top level
- Use react query and the `getRqHelper` to fetch and mutate data on the server.
- Avoid enums, prefer union types
- After generating code, you MUST make sure that the linter and formatter is happy by running the linter and formatter.
- NEVER use `as any` or casting generally unless specifically asked to. If you need type either use `satisfies` or type the object directly as needed - e.g. `const test:number = 3`.
