"use client";

import { type } from "arktype";
import { FieldError } from "../../core/field";
import {
  clearFormError,
  setFieldError,
  setFormError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import { PasswordInput } from "../core/password-input";
import { PasswordSchema } from "../schema/password";
import type { AuthResult } from "@rectangular-labs/auth/adapter/types";

// ─── Props ───────────────────────────────────────────────────────────────────

export type ResetPasswordFormProps = {
  onSubmit: (values: {
    newPassword: string;
    oldPassword?: string | undefined;
  }) => Promise<AuthResult>;
  mode: "update" | "reset";
  disabled?: boolean | undefined;
  options?: {
    showConfirmPassword?: boolean | undefined;
  };
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ResetPasswordForm({ onSubmit, mode, disabled, options }: ResetPasswordFormProps) {
  const showConfirmPassword = options?.showConfirmPassword ?? false;

  const schema = type({
    oldPassword: mode === "update" ? PasswordSchema : type("undefined"),
    newPassword: PasswordSchema,
    confirmPassword: showConfirmPassword ? PasswordSchema : type("undefined"),
  }).narrow((value, ctx) => {
    if (
      typeof value.confirmPassword === "string" &&
      value.confirmPassword.length > 0 &&
      value.confirmPassword !== value.newPassword
    ) {
      return ctx.reject({
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    return true;
  });

  const form = useAppForm({
    defaultValues: {
      confirmPassword: showConfirmPassword ? "" : undefined,
      newPassword: "",
      oldPassword: mode === "update" ? "" : undefined,
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({
        newPassword: value.newPassword,
        oldPassword: mode === "update" ? (value.oldPassword ?? "") : undefined,
      });

      if (result.type === "error") {
        if (result.field) {
          setFieldError<typeof value>(formApi, result.field as keyof typeof value, result.message);
        } else {
          setFormError(formApi, result.message);
        }
      }

      return result;
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
        {mode === "update" ? (
          <form.AppField name="oldPassword">
            {(field) => (
              <field.FieldShell label="Current password">
                <PasswordInput
                  autoComplete="current-password"
                  disabled={disabled}
                  enableToggle
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.currentTarget.value as never);
                  }}
                  placeholder="Your current password"
                  value={field.state.value ?? ""}
                />
              </field.FieldShell>
            )}
          </form.AppField>
        ) : null}

        <form.AppField name="newPassword">
          {(field) => (
            <field.FieldShell label="New password">
              <PasswordInput
                autoComplete="new-password"
                disabled={disabled}
                enableToggle
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.currentTarget.value as never);
                }}
                placeholder="At least 8 characters"
                value={field.state.value ?? ""}
              />
            </field.FieldShell>
          )}
        </form.AppField>

        {showConfirmPassword ? (
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.FieldShell label="Confirm password">
                <PasswordInput
                  autoComplete="new-password"
                  disabled={disabled}
                  enableToggle
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.currentTarget.value as never);
                  }}
                  placeholder="Confirm your password"
                  value={field.state.value ?? ""}
                />
              </field.FieldShell>
            )}
          </form.AppField>
        ) : null}

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full" disabled={disabled}>
          {mode === "update" ? "Update password" : "Reset password"}
        </form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
