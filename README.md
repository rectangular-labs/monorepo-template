# Basic Monorepo Template

This repo sets up a basic typescript monorepo.

## Structure

This monorepo uses Turborepo and contains the following structure:

- `apps`: Contains the applications (e.g., `web`, `docs`).
- `packages`: Contains shared packages used across applications (e.g., `ui`, `config`, `db`).

## Environment Variables

Environment variables are managed using `pnpm`. To set an environment variable across all environments (development, preview, production), use:

```bash
pnpm env:set <VARIABLE_NAME> <VALUE>
```

This command updates the `.env` file in the root, which is used by all workspaces.

To override a variable specifically for your local development environment without affecting the shared `.env` file, use the `-f` flag to target `.env.local`:

```bash
pnpm env:set <VARIABLE_NAME> <VALUE> -f .env.local
```

The `.env.local` file is ignored by Git and allows you to have local-specific settings.

The values in `.env` are encrypted by default so it can be easily shared across teams. Refer to the [dotenvx](https://dotenvx.com/) documentation for more.

## Database

This project uses PostgreSQL as its database. A Docker Compose setup is provided for easy local development when you run `pnpm dev`

## Development

You'll need Docker to be running.

Run `pnpm dev` to start up the frontend and server.

Finally visit `https://localhost:6969` to see your dev
 server

### First time set-up

If this is your first time setting things up, you'll have to do a few extra things:

1. Run `docker compose up -d` to launch the postgres DB.
2. Run `pnpm db:push` to update the db with the default schema
3. Run `pnpm dev`. Note you might have to accept some certs since we use the `mkcert` vite plugin to develop on `https` by default.

## Credits

This repository was originally inspired by via [create t3 turbo](https://github.com/t3-oss/create-t3-turbo) and wouldn't be possible without all the other open source tooling.
