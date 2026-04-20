"use client";

import type { AuthResult } from "@rectangular-labs/auth/adapter/types";
import {
  clearFormError,
  handleFormResultError,
  toFieldErrors,
  useAppForm,
} from "@rectangular-labs/ui/components/tanstack-form";
import { Button } from "@rectangular-labs/ui/core/button";
import { Checkbox } from "@rectangular-labs/ui/core/checkbox";
import { FieldError } from "@rectangular-labs/ui/core/field";
import { Input } from "@rectangular-labs/ui/core/input";
import { type } from "arktype";
import { EmailSchema } from "../../schema/email";
import { PasswordSchema } from "../../schema/password";
import { EmailFieldGroup } from "../field-groups/email";
import { PasswordFieldGroup } from "../field-groups/password";

type PasswordSignInFormProps = {
  onSubmit: (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<AuthResult>;
  options?: {
    useUsername?: boolean | undefined;
    showRememberMe?: boolean | undefined;
    showForgotPassword?: boolean | undefined;
  };
  onForgotPassword?: (() => void) | undefined;
};

export function PasswordSignInForm({
  onSubmit,
  options,
  onForgotPassword,
}: PasswordSignInFormProps) {
  const { useUsername = false, showRememberMe = true, showForgotPassword = true } = options ?? {};

  const schema = type({
    email: useUsername ? type("string > 0") : EmailSchema,
    password: PasswordSchema,
    rememberMe: "boolean",
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: !showRememberMe, // default true when remember-me is hidden
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
      });

      handleFormResultError<typeof value>(formApi, result);

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
        {useUsername ? (
          <form.AppField name="email">
            {(field) => (
              <field.FieldShell label="Username">
                <Input
                  autoComplete="username webauthn"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Enter your username"
                  type="text"
                  value={field.state.value}
                />
              </field.FieldShell>
            )}
          </form.AppField>
        ) : (
          <EmailFieldGroup fields={{ email: "email" }} form={form} />
        )}

        <PasswordFieldGroup
          autoComplete="current-password webauthn"
          fields={{ password: "password" }}
          form={form}
          label={
            <div className="flex w-full items-center justify-between">
              <span>Password</span>
              {showForgotPassword && onForgotPassword ? (
                <Button className="px-0" onClick={onForgotPassword} type="button" variant="link">
                  Forgot password?
                </Button>
              ) : null}
            </div>
          }
          placeholder="Your password"
        />

        {showRememberMe ? (
          <form.AppField name="rememberMe">
            {(field) => (
              <field.FieldShell label="Remember me" orientation="horizontal-start">
                <Checkbox
                  checked={Boolean(field.state.value)}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onCheckedChange={(checked) => {
                    field.handleChange(Boolean(checked) as never);
                  }}
                />
              </field.FieldShell>
            )}
          </form.AppField>
        ) : null}

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full">Sign in</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
