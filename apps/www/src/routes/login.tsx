import { AuthCard } from "@rectangular-labs/ui/components/auth/auth-card";
import { AuthProvider } from "@rectangular-labs/ui/components/auth/auth-provider";
import {
  DiscordIcon,
  GitHubIcon,
  GoogleIcon,
} from "@rectangular-labs/ui/components/icon";
import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { type } from "arktype";
import { authClient, getCurrentSession } from "~/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: type({
    "next?": "string",
  }),
  loaderDeps: ({ search }) => {
    return {
      next: search.next,
    };
  },
  loader: async ({ deps }) => {
    const session = await getCurrentSession();
    if (session && deps.next) {
      return redirect({ to: deps.next });
    }
    return;
  },
  component: Login,
});

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ThemeToggle className="absolute top-4 right-4" />
      <AuthProvider
        authClient={authClient}
        credentials={{
          verificationMode: "code",
          enableRememberMe: true,
        }}
        plugins={["oneTap"]}
        socialProviders={[
          {
            provider: "google",
            name: "Google",
            icon: GoogleIcon,
            method: "social",
          },
          {
            provider: "github",
            name: "GitHub",
            icon: GitHubIcon,
            method: "social",
          },
          {
            provider: "discord",
            name: "Discord",
            icon: DiscordIcon,
            method: "social",
          },
        ]}
      >
        <AuthCard />
      </AuthProvider>
    </div>
  );
}
