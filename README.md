# Vite Plus Monorepo Template

This repo is a TypeScript monorepo based on `vite-plus` for task orchestration, builds, linting, and package workflows.

## Workspace Structure

- `apps`: runnable applications such as `www`
- `packages`: shared workspace packages such as `api`, `auth`, `db`, and `ui`
- `tooling`: internal generators and shared tooling

## Tooling

- pre-commit hooks run automatically on staged files.
- Create new packages (public and private) via `vp run new:package`.
- `vp check --fix` to run all int and format with automatic fixes being applied.
- Supports running tasks with caching in [`vite.config.ts`](./vite.config.ts).
- For workspace task that don't need caching, you can add it directly to [`package.json`](./package.json) scripts.

## Environment Variables

Environment variables are managed with `dotenvx` and layered like this:

```bash
.env.production # production builds
.env            # preview builds and shared local defaults
.env.local      # local-only overrides
```

Set a variable in the root `.env` file:

```bash
pnpm env:set <VARIABLE_NAME> <VALUE>
```

Target a specific file with `-f`:

```bash
pnpm env:set <VARIABLE_NAME> <VALUE> -f .env.production
```

`.env.local` and `.env.key` are ignored by Git. Feel free to add values in `.env.local` without going through the CLI.

By default, `dotenvx` encrypts values so they can be shared safely across the team.

## First-Time Setup

1. [Install vite plus](https://viteplus.dev/guide/#install-vp)

2. Install workspace dependencies:

   ```bash
   vp install
   ```

3. Install portless (we use for stable dev URLs)

   ```bash
   npm add -g portless
   ```

4. Push the default schema to the local database:

   ```bash
   vp run db#push
   ```

5. Start the web app from the repo root:

   ```bash
   vp run dev:www
   ```

6. Open `https://www.localhost:1355`.

On the first run, Portless will need to approve various self-signed certs so that we can use SSL locally.

## Development

The main development entrypoint is:

```bash
vp run dev:www
```

That command:

- starts the local PostgreSQL container
- runs the cached workspace build with `vite-plus`
- starts the `www` app in dev mode through Portless and Vite

## Building

Workspace builds are exposed through `vite-plus` tasks at the repo root:

```bash
vp run build:preview
vp run build:production
```

- `vp build:preview` uses `.env`
- `vp build:production` uses `.env.production`

To build or preview only the `www` app directly:

```bash
vp run www#build:preview
vp run www#build:production
```

## Credits

This repository was originally inspired by [create t3 turbo](https://github.com/t3-oss/create-t3-turbo).
