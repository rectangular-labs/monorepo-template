import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { Button } from "@rectangular-labs/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/components/ui/card";
import { Input } from "@rectangular-labs/ui/components/ui/input";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";
import { getRqHelper } from "~/lib/api";

export const Route = createFileRoute("/login")({
  validateSearch: type({
    "next?": "string",
  }),
  loaderDeps: ({ search }) => {
    return {
      next: search.next,
    };
  },
  loader: ({ context, deps }) => {
    if (context.user && deps.next) {
      return redirect({ to: deps.next });
    }
    return;
  },
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");

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
    setResult("");
    // 1. Get a challenge from the worker
    const options = await startPasskeyLogin({});

    // 2. Ask the browser to sign the challenge
    const login = await startAuthentication({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the login process
    const { success } = await finishPasskeyLogin(login);
    if (success) {
      await navigate({
        to: next ?? "/",
      });
    }
  };

  const handlePasskeyRegister = async () => {
    if (username.trim().length < 4) {
      setResult("Please enter a username with at least 4 characters");
      return;
    }
    setResult("");
    // 1. Get a challenge from the worker
    const options = await startPasskeyRegistration({
      username: username.trim(),
    });
    console.log("options", options.challenge);
    // 2. Ask the browser to sign the challenge
    const registration = await startRegistration({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the registration process
    const { success } = await finishPasskeyRegistration({
      username,
      registration,
    });

    if (!success) {
      setResult("Registration failed");
    } else {
      await navigate({
        to: next ?? "/",
      });
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

        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Login or Register</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (required for registration)"
                type="text"
                value={username}
              />

              <div className="space-y-3">
                <Button
                  className="w-full"
                  disabled={isPending}
                  onClick={handlePasskeyLogin}
                  type="button"
                >
                  {isPending ? "..." : "Login with passkey"}
                </Button>

                <Button
                  className="w-full"
                  disabled={isPending || !username.trim()}
                  onClick={handlePasskeyRegister}
                  type="button"
                  variant="outline"
                >
                  {isPending ? "..." : "Register with passkey"}
                </Button>
              </div>

              {result && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    result.includes("successful")
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {result}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
