import { createFileRoute, redirect } from "@tanstack/react-router";
import { getApiClient } from "~/lib/api";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const { user } = await getApiClient().auth.getCurrentUser({});
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          next: `${location.pathname}${location.searchStr}`,
        },
      });
    }
  },
});
