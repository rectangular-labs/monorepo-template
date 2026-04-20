import { Button } from "@rectangular-labs/ui/core/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type } from "arktype";

export const Route = createFileRoute("/_authed/new-user")({
  validateSearch: type({
    "next?": "string",
  }),
  component: NewUserPage,
});

function NewUserPage() {
  const { next } = Route.useSearch();
  const destination = next || "/dashboard";

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
        New user flow
      </p>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Your account is ready.</h1>
        <p className="max-w-2xl text-muted-foreground">
          This authenticated route is the first stop for brand-new users. It gives you a place to
          add onboarding, profile setup, or workspace creation before sending them deeper into the
          app.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Continue destination: <span className="font-medium text-foreground">{destination}</span>
        </p>
      </div>
      <Button render={<Link to={destination} />}>Continue</Button>
    </main>
  );
}
