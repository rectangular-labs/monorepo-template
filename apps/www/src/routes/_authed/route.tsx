import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { apiRQ } from "~/lib/api";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location, context }) => {
    const session = await context.queryClient.fetchQuery(
      apiRQ.auth.session.current.queryOptions({
        input: undefined,
      }),
    );

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          next: `${location.pathname}${location.searchStr}`,
        },
      });
    }

    return session;
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return <Outlet />;
}
