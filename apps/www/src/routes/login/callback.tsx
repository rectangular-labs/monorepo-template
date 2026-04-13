import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Spinner } from "@rectangular-labs/ui/components/core/spinner";
import { type } from "arktype";
import { apiRQ } from "~/lib/api";
import { AuthErrorPanel, AuthPageFrame } from "./-shared";

export const Route = createFileRoute("/login/callback")({
  validateSearch: type({
    "next?": "string",
    "error?": "string",
  }),
  component: LoginCallbackPage,
});

function LoginCallbackPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const sessionQuery = useQuery(
    apiRQ.auth.session.current.queryOptions({
      input: undefined,
      enabled: !search.error,
      refetchInterval: (query) => (query.state.data ? false : 1000),
      retry: 3,
    }),
  );

  if (!sessionQuery.isLoading && sessionQuery.data) {
    void navigate({
      href: search.next ?? "/dashboard",
    });
  }

  const queryError = sessionQuery.error ? sessionQuery.error.message : undefined;
  const error = search.error || queryError;

  return (
    <AuthPageFrame
      description="Checking a few things and we'll be on our way."
      title={error ? "Authentication failed." : "Finishing authentication."}
    >
      {error ? (
        <AuthErrorPanel error={error} />
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 border border-border bg-card px-6 py-10 text-center">
          <Spinner className="size-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">This page will update shortly.</p>
          </div>
        </div>
      )}
    </AuthPageFrame>
  );
}
