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
import { PhoneFieldGroup } from "../field-groups/phone";
import type { AuthResult } from "@rectangular-labs/auth/adapter/types";

// ─── Props ───────────────────────────────────────────────────────────────────

export type PhoneIdentifierFormProps = {
  onSubmit: (values: { phone: string }) => Promise<AuthResult>;
  submitText?: React.ReactNode | undefined;
};

// ─── Component ───────────────────────────────────────────────────────────────

const phoneSchema = type({ phone: "string >= 6" });

export function PhoneIdentifierForm({
  onSubmit,
  submitText = "Continue",
}: PhoneIdentifierFormProps) {
  const form = useAppForm({
    defaultValues: { phone: "" },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({ phone: value.phone });

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
      onChange: phoneSchema,
      onSubmit: phoneSchema,
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
        <PhoneFieldGroup fields={{ phone: "phone" }} form={form} label="Phone number" />

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className="w-full">{submitText}</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
