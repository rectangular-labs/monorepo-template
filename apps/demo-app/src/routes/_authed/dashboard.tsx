import { Button } from "@rectangular-labs/ui/core/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { apiRQ } from "~/lib/api";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const signOut = useMutation(
    apiRQ.auth.session.signOut.mutationOptions({
      onSuccess: async (result) => {
        if (!result.success) {
          return;
        }
        queryClient.setQueryData(apiRQ.auth.session.current.queryKey({ input: undefined }), null);
        await router.invalidate();
      },
    }),
  );

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col gap-4 px-6 py-16 lg:px-0">
      <p className="text-muted-foreground text-sm font-medium tracking-[0.24em] uppercase">
        Protected
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground max-w-2xl">
        This route is guarded by the current Auth session. Unauthenticated visitors will be
        redirected to the login page.
      </p>
      <div>
        <Button
          isLoading={signOut.isPending}
          onClick={() => signOut.mutate(undefined)}
          variant="outline"
        >
          Sign out
        </Button>
      </div>
    </main>
  );
}
