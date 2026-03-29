"use client";

import { type } from "arktype";
import { useState } from "react";
import { FieldError } from "../../core/field";
import { toast } from "../../core/sonner";
import { clearFormError, setFormError, toFieldErrors, useAppForm } from "../../ui/tanstack-form";
import { useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";
import { PasswordSchema } from "../schema/password";

type ChangePasswordProps = { onComplete?: () => void | Promise<void> } & (
  | {
      mode: "update";
    }
  | {
      code: string;
      email: string;
      mode: "reset-code";
    }
  | {
      mode: "reset-token";
      token: string;
    }
);

export function ChangePasswordForm(props: ChangePasswordProps) {
  const { authClient, credentials } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmPasswordEnabled = credentials?.enableConfirmPassword;
  const schema = type({
    oldPassword: props.mode === "update" ? PasswordSchema : type("undefined"),
    newPassword: PasswordSchema,
    confirmPassword: confirmPasswordEnabled ? PasswordSchema : type("undefined"),
  }).narrow((value, ctx) => {
    if (value.confirmPassword?.length && value.confirmPassword !== value.newPassword) {
      return ctx.reject({
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    return true;
  });

  const form = useAppForm({
    defaultValues: {
      confirmPassword: confirmPasswordEnabled ? "" : undefined,
      newPassword: "",
      oldPassword: props.mode === "update" ? "" : undefined,
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      setIsSubmitting(true);

      const response = await (() => {
        if (props.mode === "update") {
          return authClient.changePassword({
            currentPassword: value.oldPassword ?? "",
            newPassword: value.newPassword,
            revokeOtherSessions: true,
          });
        }
        if (props.mode === "reset-token") {
          return authClient.resetPassword({
            newPassword: value.newPassword,
            token: props.token,
          });
        }
        return auth.emailOtp.resetPassword({
          email: props.email,
          otp: props.code,
          password: value.newPassword,
        });
      })();

      setIsSubmitting(false);

      if (response.error) {
        setFormError(
          formApi,
          response.error.message ?? "Failed to change password. Please try again later.",
        );
        return;
      }

      await Promise.resolve(props.onComplete?.());
      toast.success("Password updated successfully");
      formApi.reset();
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
        {props.mode === "update" ? (
          <form.AppField name="oldPassword">
            {(field) => (
              <field.TextField
                autoComplete="current-password"
                disabled={isSubmitting}
                field={field}
                enableToggle
                inputComponent={PasswordInput}
                label="Current password"
                placeholder="Your current password"
              />
            )}
          </form.AppField>
        ) : null}

        <form.AppField name="newPassword">
          {(field) => (
            <field.TextField
              autoComplete="new-password"
              disabled={isSubmitting}
              field={field}
              enableToggle
              inputComponent={PasswordInput}
              label="New password"
              placeholder="At least 8 characters"
            />
          )}
        </form.AppField>

        {confirmPasswordEnabled ? (
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField
                autoComplete="new-password"
                disabled={isSubmitting}
                field={field}
                enableToggle
                inputComponent={PasswordInput}
                label="Confirm password"
                placeholder="Repeat new password"
              />
            )}
          </form.AppField>
        ) : null}

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full">
          {props.mode === "update" ? "Update password" : "Reset password"}
        </form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
