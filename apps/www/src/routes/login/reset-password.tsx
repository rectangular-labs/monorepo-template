import { ResetPasswordForm } from "@rectangular-labs/auth/components/forms/reset-password";
import { VerificationForm } from "@rectangular-labs/auth/components/forms/verification";
import { useAuthFlow } from "@rectangular-labs/auth/components/use-auth-flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/core/card";
import { createFileRoute } from "@tanstack/react-router";

import { type } from "arktype";
import { authAdapter, createLoginCallbackURLs } from "~/lib/auth";
import { clientEnv } from "~/lib/env";
import { AuthErrorPanel, AuthPageFrame } from "./-shared";

export const Route = createFileRoute("/login/reset-password")({
  validateSearch: type({
    "identifier?": "string|undefined",
    "next?": "string|undefined",
    "token?": "string|undefined",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const verificationType = clientEnv().VITE_AUTH_EMAIL_VERIFICATION_TYPE;

  const hasResetContext =
    verificationType === "code"
      ? Boolean(search.identifier)
      : Boolean(search.token || search.identifier);

  const flow = useAuthFlow({
    adapter: authAdapter,
    callbackURLs: createLoginCallbackURLs(search.next),
    initialState: {
      step: "reset-password",
      identifier: search.identifier,
      token: search.token,
    },
    navigate: async (url) => {
      await navigate({
        href: url,
      });
    },
  });

  return (
    <AuthPageFrame
      description="Choose a new password to finish recovering your account."
      title="Set a new password."
    >
      {(() => {
        if (!hasResetContext) {
          return (
            <AuthErrorPanel
              error={
                verificationType === "code"
                  ? "This password reset page is missing the required identifier."
                  : "This password reset page is missing the required token."
              }
              title="Reset request is invalid."
            />
          );
        }

        switch (verificationType) {
          case "code": {
            if (!search.identifier) {
              // this won't happen since we check for it above
              return null;
            }
            const { identifier } = search;
            return (
              <ResetPasswordForm
                verificationType="code"
                onResend={() => {
                  return flow.auth.sendCode({
                    identifier,
                    mode: "password-reset-email-code",
                  });
                }}
                onSubmit={(values) => {
                  return flow.auth.resetPassword({
                    type: "email-code",
                    code: values.code,
                    email: identifier,
                    newPassword: values.newPassword,
                  });
                }}
              />
            );
          }

          case "token": {
            if (!search.token) {
              if (!search.identifier) {
                // this will never happen since we checked for token or identifier above.
                return null;
              }
              const { identifier } = search;
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardDescription>Check your inbox for the password reset link.</CardDescription>
                    <VerificationForm
                      info={{
                        identifier,
                        mode: "password-reset-email-token",
                      }}
                      onResend={() =>
                        flow.auth.sendCode({
                          identifier,
                          mode: "password-reset-email-token",
                        })
                      }
                      onSubmit={() =>
                        Promise.resolve({
                          type: "success" as const,
                        })
                      }
                    />
                  </CardContent>
                </Card>
              );
            }
            const { token } = search;
            return (
              <ResetPasswordForm
                verificationType="token"
                onSubmit={(values) => {
                  return flow.auth.resetPassword({
                    type: "email-token",
                    token: token,
                    newPassword: values.newPassword,
                  });
                }}
              />
            );
          }

          default:
            const _never: never = verificationType;
            return null;
        }
      })()}
    </AuthPageFrame>
  );
}
