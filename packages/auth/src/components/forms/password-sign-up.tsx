"use client";

import type { AuthResult } from "@rectangular-labs/auth/adapter/types";
import {
  clearFormError,
  handleFormResultError,
  toFieldErrors,
  useAppForm,
} from "@rectangular-labs/ui/components/tanstack-form";
import { FieldError } from "@rectangular-labs/ui/core/field";
import { Input } from "@rectangular-labs/ui/core/input";
import { cn } from "@rectangular-labs/ui/utils";
import { type } from "arktype";
import { EmailSchema } from "../../schema/email";
import { PasswordSchema } from "../../schema/password";
import { EmailFieldGroup } from "../field-groups/email";
import { PasswordFieldGroup } from "../field-groups/password";

export type PasswordSignUpFormProps = {
  onSubmit: (values: {
    email: string;
    password: string;
    name?: string | undefined;
    username?: string | undefined;
  }) => Promise<AuthResult>;
  options?: {
    showName?: boolean | undefined;
    showUsername?: boolean | undefined;
    showConfirmPassword?: boolean | undefined;
  };
};

export function PasswordSignUpForm({ onSubmit, options }: PasswordSignUpFormProps) {
  const { showName = false, showUsername = false, showConfirmPassword = false } = options ?? {};

  const schema = type({
    email: EmailSchema,
    password: PasswordSchema,
    username: showUsername ? "string >= 3" : "undefined",
    confirmPassword: showConfirmPassword ? PasswordSchema : type("undefined"),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: showConfirmPassword ? "" : undefined,
      username: showUsername ? "" : undefined,
      name: showName ? "" : undefined,
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({
        email: value.email,
        password: value.password,
        name: value.name,
        username: value.username,
      });

      handleFormResultError<typeof value>(formApi, result, {
        focusInvalidField: true,
        password: {
          enabled: true,
          confirmField: showConfirmPassword ? "confirmPassword" : undefined,
        },
      });

      return result;
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
        {showName ? (
          <form.AppField name="name">
            {(field) => (
              <field.FieldShell label="Name">
                <Input
                  form={form.formId}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.currentTarget.value);
                  }}
                  placeholder="Your name"
                  value={typeof field.state.value === "string" ? field.state.value : ""}
                />
              </field.FieldShell>
            )}
          </form.AppField>
        ) : null}

        {showUsername ? (
          <form.AppField name="username">
            {(field) => (
              <field.FieldShell label="Username">
                <Input
                  autoComplete="username"
                  form={form.formId}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.currentTarget.value);
                  }}
                  placeholder="Choose a username"
                  value={typeof field.state.value === "string" ? field.state.value : ""}
                />
              </field.FieldShell>
            )}
          </form.AppField>
        ) : null}

        <EmailFieldGroup
          autoComplete="email"
          fields={{ email: "email" }}
          form={form}
          label="Email"
          placeholder="you@example.com"
        />

        <PasswordFieldGroup
          autoComplete="new-password"
          fields={
            showConfirmPassword
              ? { confirmPassword: "confirmPassword", password: "password" }
              : { password: "password" }
          }
          form={form}
          label="Password"
          placeholder="Password"
          showConfirmPassword={showConfirmPassword}
        />

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className={cn("w-full")}>Sign Up</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
