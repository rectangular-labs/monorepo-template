"use client";

import type { AuthResult } from "@rectangular-labs/auth/adapter/types";
import {
  clearFormError,
  handleFormResultError,
  toFieldErrors,
  useAppForm,
} from "@rectangular-labs/ui/components/tanstack-form";
import { FieldError } from "@rectangular-labs/ui/core/field";
import { type } from "arktype";
import * as React from "react";
import { EmailFieldGroup } from "../field-groups/email";

export type EmailIdentifierFormProps = {
  onSubmit: (values: { email: string }) => Promise<AuthResult>;
  submitText?: React.ReactNode | undefined;
};

const emailSchema = type({ email: "string.email >= 1" });

export function EmailIdentifierForm({
  onSubmit,
  submitText = "Continue",
}: EmailIdentifierFormProps) {
  const form = useAppForm({
    defaultValues: { email: "" },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({ email: value.email });

      handleFormResultError<typeof value>(formApi, result);

      return result;
    },
    validators: {
      onChange: emailSchema,
      onSubmit: emailSchema,
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
        <EmailFieldGroup
          fields={{ email: "email" }}
          form={form}
          label="Email"
          placeholder="you@example.com"
        />

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full">{submitText}</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
