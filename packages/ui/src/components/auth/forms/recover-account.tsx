"use client";

import { type } from "arktype";
import { useState } from "react";
import { Input } from "../../core/input";
import { clearFormError, setFieldError, useAppForm } from "../../ui/tanstack-form";
import { useAuth } from "../auth-provider";

export function RecoverAccountForm() {
  const { authClient, onSuccess } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = type({ code: "string > 0" });

  const form = useAppForm({
    defaultValues: { code: "" },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      setIsSubmitting(true);
      const response = await auth.twoFactor.verifyBackupCode({
        code: value.code,
      });
      setIsSubmitting(false);

      if (response.error) {
        setFieldError<typeof schema.infer>(
          formApi,
          "code",
          response.error.message ?? "Failed to verify backup code",
        );
        formApi.resetField("code");
        return;
      }

      void onSuccess?.();
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
        <form.AppField name="code">
          {(field) => (
            <field.FieldShell field={field} label="Backup code">
              <Input
                autoComplete="off"
                disabled={isSubmitting}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.currentTarget.value as never);
                  field.setErrorMap({ onSubmit: undefined });
                }}
                placeholder="Your backup code"
                value={field.state.value}
              />
            </field.FieldShell>
          )}
        </form.AppField>

        <form.SubmitButton>Recover account</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
