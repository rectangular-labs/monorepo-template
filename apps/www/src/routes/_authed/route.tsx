import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentSession } from "~/lib/auth";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          next: `${location.pathname}${location.searchStr}`,
        },
      });
    }
  },
});
