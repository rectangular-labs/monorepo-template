"use client";

import { type } from "arktype";
import { useState } from "react";
import { Button } from "../../core/button";
import { FieldError } from "../../core/field";
import { clearFormError, setFormError, toFieldErrors, useAppForm } from "../../ui/tanstack-form";
import { type AuthViewPath, useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";
import type { VerificationInfo } from "./verification-form";

export function SignInForm({
  setView,
  shouldDisable,
  setShouldDisable,
  setVerificationInfo,
}: {
  setView: (view: AuthViewPath) => void;
  shouldDisable: boolean;
  setShouldDisable: (disabled: boolean) => void;
  setVerificationInfo: (verificationInfo: VerificationInfo) => void;
}) {
  const { authClient, viewPaths, credentials, successHandler } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameEnabled = credentials?.useUsername;
  const rememberMeEnabled = credentials?.enableRememberMe;
  const schema = type({
    email: usernameEnabled ? "string > 0" : "string.email >= 1",
    password: "string > 0",
    rememberMe: "boolean",
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: !rememberMeEnabled,
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      setShouldDisable(true);
      setIsSubmitting(true);

      const response = await (async () => {
        if (usernameEnabled) {
          return await auth.signIn.username({
            password: value.password,
            rememberMe: value.rememberMe,
            username: value.email,
          });
        }

        return await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        });
      })();

      setIsSubmitting(false);
      setShouldDisable(false);

      if (response.error) {
        if (response.error.status === 403) {
          if (credentials?.verificationMode === "code") {
            setView(viewPaths.IDENTITY_VERIFICATION);
            setVerificationInfo({
              identifier: value.email,
              mode: "verification-email-code",
            });
          }
          if (credentials?.verificationMode === "token") {
            setView(viewPaths.IDENTITY_VERIFICATION);
            setVerificationInfo({
              identifier: value.email,
              mode: "verification-email-token",
            });
          }
          return;
        }

        setFormError(
          formApi,
          response.error.message ?? "Something went wrong. Please try again later.",
        );
        return;
      }

      if ("twoFactorRedirect" in response.data) {
        setView(viewPaths.TWO_FACTOR);
        return;
      }

      await successHandler();
    },
    validators: {
      onChange: schema,
      onSubmit: schema,
    },
  });

  if (!credentials) {
    console.warn(
      "Rendering the sign in form but credentials was set to `undefined` in the `AuthProvider`.",
    );
    return null;
  }

  return (
    <form.AppForm>
      <form
        className="grid w-full gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              autoComplete={usernameEnabled ? "username webauthn" : "email webauthn"}
              disabled={isSubmitting || shouldDisable}
              field={field}
              label={usernameEnabled ? "Username" : "Email"}
              placeholder={usernameEnabled ? "Enter your username" : "Enter your email"}
              type={usernameEnabled ? "text" : "email"}
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.TextField
              autoComplete="current-password webauthn"
              disabled={isSubmitting || shouldDisable}
              field={field}
              inputComponent={PasswordInput}
              label={
                <div className="flex items-center justify-between">
                  <span>Password</span>
                  {credentials.enableForgotPassword ? (
                    <Button
                      className="px-0"
                      onClick={() => setView(viewPaths.FORGOT_PASSWORD)}
                      type="button"
                      variant="link"
                    >
                      Forgot password?
                    </Button>
                  ) : null}
                </div>
              }
              placeholder="Your password"
            />
          )}
        </form.AppField>

        {rememberMeEnabled ? (
          <form.AppField name="rememberMe">
            {(field) => (
              <field.CheckboxField
                disabled={isSubmitting || shouldDisable}
                field={field}
                label="Remember me"
              />
            )}
          </form.AppField>
        ) : null}

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full" disabled={shouldDisable}>
          Sign in
        </form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
