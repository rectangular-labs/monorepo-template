"use client";

import type { AuthResult } from "@rectangular-labs/auth/adapter/types";
import { type } from "arktype";
import { FieldError } from "../../core/field";
import {
  clearFormError,
  handleFormResultError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import { PasswordInput } from "../core/password-input";
import { PasswordFieldGroup } from "../field-groups/password";
import { PasswordSchema } from "../schema/password";

export type ChangePasswordFormProps = {
  onSubmit: (values: { newPassword: string; oldPassword: string }) => Promise<AuthResult>;
  options?: {
    showConfirmPassword?: boolean | undefined;
  };
};

export function ChangePasswordForm({ onSubmit, options }: ChangePasswordFormProps) {
  const showConfirmPassword = options?.showConfirmPassword ?? false;

  const schema = type({
    oldPassword: PasswordSchema,
    password: PasswordSchema,
    confirmPassword: showConfirmPassword ? PasswordSchema : type("undefined"),
  });

  const form = useAppForm({
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: showConfirmPassword ? "" : undefined,
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({
        newPassword: value.password,
        oldPassword: value.oldPassword,
      });

      handleFormResultError<typeof value>(formApi, result, {
        password: {
          enabled: true,
          confirmField: showConfirmPassword ? "confirmPassword" : undefined,
        },
      });

      return result;
    },
    validators: {
      onSubmit: schema,
    },
  });

  return (
    <form.AppForm>
      <form
        id={form.formId}
        className="grid w-full gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.AppField name="oldPassword">
          {(field) => (
            <field.FieldShell label="Current password">
              <PasswordInput
                autoComplete="current-password"
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

        <PasswordFieldGroup
          fields={{
            password: "password",
            confirmPassword: "confirmPassword",
          }}
          form={form}
          label="New password"
          placeholder="At least 8 characters"
          showConfirmPassword={showConfirmPassword}
        />

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full">Update password</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
