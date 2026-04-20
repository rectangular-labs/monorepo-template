# Repository Conventions

## UI

### Icons

- Export shared icons for external consumers from `packages/ui/src/components/icon.tsx`.
- When code outside the `@rectangular-labs/ui` package needs an icon, import it from `packages/ui/src/components/icon.tsx` rather than directly from `@phosphor-icons/react`.
- Code inside the UI package may import directly from `@phosphor-icons/react` when that is the most direct internal implementation detail.

Examples:

- `packages/ui/src/components/core/button.tsx` may use `@phosphor-icons/react` directly.
- `apps/www/src/routes/login/-shared.tsx` should consume icons from `packages/ui/src/components/icon.tsx`.
