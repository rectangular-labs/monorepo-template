import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { Button } from "@rectangular-labs/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/components/ui/card";
import { Input } from "@rectangular-labs/ui/components/ui/input";
import { Separator } from "@rectangular-labs/ui/components/ui/separator";
import { Toaster, toast } from "@rectangular-labs/ui/components/ui/sonner";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";
import { getApiClient, getRqHelper } from "~/lib/api";

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
    const { user } = await getApiClient().auth.getCurrentUser({});
    if (user && deps.next) {
      return redirect({ to: deps.next });
    }
    return;
  },
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const [username, setUsername] = useState("");

  const {
    mutateAsync: startPasskeyRegistration,
    isPending: isStartRegistrationPending,
  } = useMutation(
    getRqHelper().auth.passkey.startRegistration.mutationOptions(),
  );
  const {
    mutateAsync: finishPasskeyRegistration,
    isPending: isFinishRegistrationPending,
  } = useMutation(
    getRqHelper().auth.passkey.finishRegistration.mutationOptions(),
  );

  const { mutateAsync: startPasskeyLogin, isPending: isStartLoginPending } =
    useMutation(getRqHelper().auth.passkey.startLogin.mutationOptions());
  const { mutateAsync: finishPasskeyLogin, isPending: isFinishLoginPending } =
    useMutation(getRqHelper().auth.passkey.finishLogin.mutationOptions());

  const navigate = useNavigate();
  const handlePasskeyLogin = async () => {
    try {
      // 1. Get a challenge from the worker
      const options = await startPasskeyLogin({});

      // 2. Ask the browser to sign the challenge
      const login = await startAuthentication({ optionsJSON: options });

      // 3. Give the signed challenge to the worker to finish the login process
      await finishPasskeyLogin(login);

      toast.success("Login successful!");
      await navigate({
        to: next ?? "/",
      });
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  const handlePasskeyRegister = async () => {
    if (username.trim().length < 4) {
      toast.error("Please enter a username with at least 4 characters");
      return;
    }

    try {
      // 1. Get a challenge from the worker
      const options = await startPasskeyRegistration({
        username: username.trim(),
      });
      console.log("options", options.challenge);
      // 2. Ask the browser to sign the challenge
      const registration = await startRegistration({ optionsJSON: options });

      // 3. Give the signed challenge to the worker to finish the registration process
      await finishPasskeyRegistration({
        username,
        registration,
      });

      toast.success("Registration successful!");
      await navigate({
        to: next ?? "/",
      });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const isPending =
    isStartRegistrationPending ||
    isFinishRegistrationPending ||
    isStartLoginPending ||
    isFinishLoginPending;

  return (
    <div className="min-h-screen">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-8 font-bold text-4xl tracking-tight">
          Passkey Authentication
        </h1>

        <div className="w-full max-w-lg space-y-6">
          {/* Login Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Welcome Back</CardTitle>
              <p className="text-center text-muted-foreground text-sm">
                Sign in to your account using your passkey
              </p>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={handlePasskeyLogin}
                size="lg"
                type="button"
              >
                {isPending ? "Signing in..." : "Sign in with passkey"}
              </Button>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create new account
              </span>
            </div>
          </div>

          {/* Registration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Create Account</CardTitle>
              <p className="text-center text-muted-foreground text-sm">
                Register a new account with your passkey
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username (minimum 4 characters)"
                type="text"
                value={username}
              />
              <Button
                className="w-full"
                disabled={isPending || !username.trim()}
                onClick={handlePasskeyRegister}
                size="lg"
                type="button"
                variant="outline"
              >
                {isPending
                  ? "Creating account..."
                  : "Create account with passkey"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
