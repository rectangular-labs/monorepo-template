"use client";

import { type } from "arktype";
import * as React from "react";
import { FieldError } from "../../core/field";
import {
  clearFormError,
  setFieldError,
  setFormError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import { EmailFieldGroup } from "../field-groups/email";
import type { AuthResult } from "@rectangular-labs/auth/adapter/types";

// ─── Props ───────────────────────────────────────────────────────────────────

export type EmailIdentifierFormProps = {
  onSubmit: (values: { email: string }) => Promise<AuthResult>;
  submitText?: React.ReactNode | undefined;
};

// ─── Component ───────────────────────────────────────────────────────────────

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
