import { Section } from "@rectangular-labs/ui/components/section";
import { Button } from "@rectangular-labs/ui/core/button";
import { Link } from "@tanstack/react-router";

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <Section className="flex min-h-screen items-center justify-center text-center">
      <div className="mx-auto max-w-xl">
        <p className="text-muted-foreground font-mono text-xs tracking-widest">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-5xl">
          Page not found
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-prose text-balance">
          {children || "The page you are looking for does not exist or has been moved."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => window.history.back()} type="button" variant="outline">
            Go back
          </Button>
          <Button render={<Link to="/" />}>Go to home</Button>
        </div>
      </div>
    </Section>
  );
}
