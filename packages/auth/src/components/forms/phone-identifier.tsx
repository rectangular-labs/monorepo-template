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
import { PhoneFieldGroup } from "../field-groups/phone";

export type PhoneIdentifierFormProps = {
  onSubmit: (values: { phone: string }) => Promise<AuthResult>;
  submitText?: React.ReactNode | undefined;
};

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

      handleFormResultError<typeof value>(formApi, result);

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
        id={form.formId}
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
