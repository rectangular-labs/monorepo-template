# Vite Plus Monorepo Template

This repo is a TypeScript monorepo built around `vite-plus` for workspace orchestration, builds, linting, and package workflows.

## Workspace Structure

- `apps`: runnable applications such as `demo-blog` and `demo-app`
- `packages`: shared workspace packages such as `api`, `auth`, `db`, and `ui`
- `tooling`: internal generators and shared tooling

## Tooling

- Pre-commit hooks run automatically on staged files.
- Create new packages via `vpr new:package`.
- Run `vp check --fix` to apply lint and format fixes.
- Workspace builds and tasks are orchestrated with `vite-plus`.

## Environment Variables

Environment variables are managed with `dotenvx` and layered like this:

```bash
.env.production # production builds
.env            # preview builds and shared local defaults
.env.local      # local-only overrides
```

Set a variable in the root `.env` file:

```bash
vpr env:set <VARIABLE_NAME> <VALUE> #defaults to .env
```

Target a specific file with `-f`:

```bash
vpr env:set <VARIABLE_NAME> <VALUE> -f .env.production
```

`.env.local` and `.env.key` are ignored by Git. Feel free to add values in `.env.local` without going through the CLI.

By default, `dotenvx` encrypts values so they can be shared safely across the team.

## First-Time Setup

1. [Install vite plus](https://viteplus.dev/guide/#install-vp)
2. Install workspace dependencies:

   ```bash
   vp install # shorthand: vp i
   ```

3. Push the default schema to the local database:

   ```bash
   docker compose up -d # Spin up the database
   vp run db#push
   ```

4. Configure `.env` variables.

   Required for local setup:
   - `VITE_BLOG_URL`: public URL for the marketing site
   - `VITE_APP_URL`: public URL for the demo app
   - `DATABASE_URL`: database connection string
   - `VITE_AUTH_EMAIL_VERIFICATION_TYPE`: email verification mode for password auth, currently `code` or `token`
   - `AUTH_ENCRYPTION_KEY`: auth encryption key, minimum 32 characters
   - `AUTH_FROM_EMAIL`: sender address for auth emails

   Optional auth providers:
   - `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`
   - `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
   - `AUTH_REDDIT_ID` and `AUTH_REDDIT_SECRET`
   - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

5. Start the demo-blog app:

   ```bash
   vpr dev:demo-blog
   ```

6. Start the demo-app app:

   ```bash
   vpr dev:demo-app
   ```

## Development

The main development entrypoints are:

```bash
vpr dev:demo-blog
vpr dev:demo-app
```

## Building

Workspace builds are exposed through `vite-plus` tasks at the repo root:

```bash
vp run build:preview
vp run build:production
```

To build individual apps directly:

```bash
vp run www#build:preview
vp run www#build:production
vp run demo-app#build:preview
vp run demo-app#build:production
```

## Deployment

This repository includes a [GitHub Action](.github/workflows/cloudflare.yml) for automated deployments to Cloudflare.

The workflow:

- deploys preview environments for pull requests
- deploys production on pushes to `main`
- supports manual preview and production deploys from GitHub Actions
- deploys both apps in the same run

Configure these repository secrets in GitHub:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `DOTENV_PRIVATE_KEY`
- `DOTENV_PRIVATE_KEY_PRODUCTION`

When adding new deployable apps, update `.github/workflows/cloudflare.yml` so build, deploy, preview comments, and cleanup stay in sync.

## Credits

This repository was originally inspired by [create t3 turbo](https://github.com/t3-oss/create-t3-turbo).
