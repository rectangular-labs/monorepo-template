import { WarningCircle } from "@rectangular-labs/ui/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@rectangular-labs/ui/core/alert";
import { buttonVariants } from "@rectangular-labs/ui/core/button";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthPageFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Authentication
          </p>
          <h1 className="text-foreground max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <div className="text-muted-foreground max-w-xl text-base">{description}</div>
        </div>

        <div className="w-full space-y-6">{children}</div>
      </div>
    </main>
  );
}

function formatAuthError(error?: string) {
  if (!error) {
    return "Something went wrong while completing authentication.";
  }

  const normalized = error.replaceAll("+", " ");

  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

export function AuthErrorPanel({
  error,
  title = "Authentication could not be completed.",
}: {
  error?: string;
  title?: string;
}) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <WarningCircle />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{formatAuthError(error)}</AlertDescription>
      </Alert>

      <Link
        to={"/login"}
        search={(prev) =>
          prev.next
            ? {
                next: prev.next,
              }
            : {}
        }
        className={buttonVariants({ variant: "outline" })}
      >
        Back to sign in
      </Link>
    </div>
  );
}
