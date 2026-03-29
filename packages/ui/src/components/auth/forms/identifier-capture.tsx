"use client";

import { SpinnerIcon } from "@phosphor-icons/react";
import { type } from "arktype";
import type * as React from "react";
import { useState } from "react";
import { Button } from "../../core/button";
import { FieldError } from "../../core/field";
import { Input } from "../../core/input";
import { clearFormError, setFormError, toFieldErrors, useAppForm } from "../../ui/tanstack-form";
import { PhoneInput } from "../../ui/phone-input";
import type { AuthViewPath } from "../auth-provider";
import { useAuth } from "../auth-provider";
import type { VerificationInfo } from "./verification-form";

type IdentifierCaptureMode =
  | "magic-link"
  | "email-code"
  | "forget-password-email"
  | "phone-code"
  | "forget-password-phone";

type IdentifierCaptureFormProps = {
  children?: React.ReactNode;
  mode: IdentifierCaptureMode;
  setShouldDisable: (disabled: boolean) => void;
  setVerificationInfo: (info: VerificationInfo) => void;
  setView: (view: AuthViewPath) => void;
  shouldDisable?: boolean;
  submitText?: React.ReactNode | undefined;
};

export function IdentifierCaptureForm({
  mode,
  submitText = "Continue",
  setView,
  setVerificationInfo,
  shouldDisable = false,
  setShouldDisable,
  children,
}: IdentifierCaptureFormProps) {
  if (mode === "magic-link" || mode === "email-code" || mode === "forget-password-email") {
    return (
      <EmailForm
        mode={mode}
        setShouldDisable={setShouldDisable}
        setVerificationInfo={setVerificationInfo}
        setView={setView}
        shouldDisable={shouldDisable}
        submitText={submitText}
      >
        {children}
      </EmailForm>
    );
  }

  return (
    <PhoneForm
      mode={mode}
      setShouldDisable={setShouldDisable}
      setVerificationInfo={setVerificationInfo}
      setView={setView}
      shouldDisable={shouldDisable}
      submitText={submitText}
    >
      {children}
    </PhoneForm>
  );
}

function EmailForm({
  mode,
  submitText,
  setView,
  setVerificationInfo,
  shouldDisable,
  setShouldDisable,
  children,
}: IdentifierCaptureFormProps) {
  const {
    authClient,
    viewPaths,
    credentials,
    successCallbackURL,
    errorCallbackURL,
    newUserCallbackURL,
    resetPasswordCallbackURL,
  } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = type({ email: "string.email >= 1" });

  const form = useAppForm({
    defaultValues: { email: "" },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      if (mode === "phone-code" || mode === "forget-password-phone") {
        return;
      }

      if (mode === "forget-password-email" && !credentials) {
        console.warn("Attempted to use forgot password when no credentials were passed.");
      }

      const isCode = credentials?.verificationMode === "code";

      setShouldDisable(true);
      setIsSubmitting(true);

      const response = await (() => {
        switch (mode) {
          case "magic-link":
            return auth.signIn.magicLink({
              callbackURL: successCallbackURL,
              email: value.email,
              errorCallbackURL,
              newUserCallbackURL,
            });
          case "email-code":
            return auth.emailOtp.sendVerificationOtp({
              email: value.email,
              type: "sign-in",
            });
          case "forget-password-email":
            // ! Better Auth 1.5 removed the deprecated email-OTP forget-password flow.
            // ! Replace the code branch below with token-based authClient.requestPasswordReset().
            // ! More info: https://better-auth.com/blog/1-5
            return isCode
              ? auth.emailOtp.sendVerificationOtp({
                  email: value.email,
                  type: "forget-password",
                })
              : authClient.requestPasswordReset({
                  email: value.email,
                  redirectTo: resetPasswordCallbackURL,
                });
          default: {
            const _never: never = mode;
            throw new Error("Invalid mode for email");
          }
        }
      })();

      setIsSubmitting(false);
      setShouldDisable(false);

      if (response?.error) {
        if (response.error.status === 404) {
          const message =
            mode === "magic-link"
              ? "Route not found. Did you enable the `magicLink` plugin?"
              : "Route not found. Did you enable the `emailOtp` plugin?";
          setFormError(formApi, message);
          return;
        }

        setFormError(
          formApi,
          response.error.message ?? "Something went wrong. Please try again later.",
        );
        return;
      }

      setView(viewPaths.IDENTITY_VERIFICATION);
      const verificationMode = (() => {
        switch (mode) {
          case "magic-link":
            return "magic-link-token";
          case "email-code":
            return "email-code";
          case "forget-password-email":
            return isCode ? "password-reset-email-code" : "password-reset-token";
        }
      })();

      setVerificationInfo({
        identifier: value.email,
        mode: verificationMode,
      });
    },
    validators: {
      onChange: schema,
      onSubmit: schema,
    },
  });

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
            <field.FieldShell field={field} label="Email">
              <Input
                autoComplete="email webauthn"
                disabled={isSubmitting || shouldDisable}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.currentTarget.value as never);
                  field.setErrorMap({ onSubmit: undefined });
                }}
                placeholder="you@example.com"
                type="email"
                value={field.state.value}
              />
            </field.FieldShell>
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        {children ?? (
          <form.SubmitButton className="w-full" disabled={shouldDisable}>
            {submitText}
          </form.SubmitButton>
        )}
      </form>
    </form.AppForm>
  );
}

function PhoneForm({
  mode,
  children,
  submitText,
  shouldDisable,
  setView,
  setVerificationInfo,
  setShouldDisable,
}: IdentifierCaptureFormProps) {
  const { authClient, viewPaths, credentials } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = type({ phone: "string >= 6" });

  const form = useAppForm({
    defaultValues: { phone: "" },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      if (mode === "magic-link" || mode === "email-code" || mode === "forget-password-email") {
        return;
      }

      if (mode === "forget-password-phone" && !credentials) {
        console.warn("Attempted to use forgot password when no credentials were passed.");
      }

      const isCode = credentials?.verificationMode === "code";
      if (!isCode && mode === "forget-password-phone") {
        console.warn(
          "Attempting to use token verification for phone number. This is likely a mistake. Please set verificationMode to 'code' in the AuthProvider.",
        );
        return;
      }

      setShouldDisable(true);
      setIsSubmitting(true);

      const response = await (() => {
        switch (mode) {
          case "phone-code":
            return auth.phoneNumber.sendOtp({
              phoneNumber: value.phone,
            });
          case "forget-password-phone":
            return auth.phoneNumber.requestPasswordReset({
              phoneNumber: value.phone,
            });
          default: {
            const _never: never = mode;
            throw new Error("Invalid mode for phone");
          }
        }
      })();

      setIsSubmitting(false);
      setShouldDisable(false);

      if (response?.error) {
        if (response.error.status === 404) {
          setFormError(formApi, "Route not found. Did you enable the `phoneNumber` plugin?");
          return;
        }

        setFormError(
          formApi,
          response.error.message ?? "Something went wrong. Please try again later.",
        );
        return;
      }

      setView(viewPaths.IDENTITY_VERIFICATION);
      const verificationMode = mode === "phone-code" ? "phone-code" : "password-reset-phone-code";
      setVerificationInfo({
        identifier: value.phone,
        mode: verificationMode,
      });
    },
    validators: {
      onChange: schema,
      onSubmit: schema,
    },
  });

  return (
    <form.AppForm>
      <form
        className="grid w-full gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.AppField name="phone">
          {(field) => (
            <field.FieldShell field={field} label="Phone number">
              <PhoneInput
                defaultCountry="US"
                disabled={Boolean(isSubmitting || shouldDisable)}
                onBlur={field.handleBlur}
                onChange={(value) => {
                  field.handleChange((value ?? "") as never);
                  field.setErrorMap({ onSubmit: undefined });
                }}
                placeholder="(555) 123-4567"
                value={(field.state.value as string | undefined) ?? ""}
              />
            </field.FieldShell>
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        {children ?? (
          <Button className="w-full" disabled={isSubmitting || shouldDisable} type="submit">
            {isSubmitting ? <SpinnerIcon className="animate-spin" /> : null}
            {submitText}
          </Button>
        )}
      </form>
    </form.AppForm>
  );
}
