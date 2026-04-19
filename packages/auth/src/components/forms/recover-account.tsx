"use client";

import type { AuthResult } from "@rectangular-labs/auth/adapter/types";
import {
  clearFormError,
  handleFormResultError,
  toFieldErrors,
  useAppForm,
} from "@rectangular-labs/ui/components/tanstack-form";
import { Checkbox } from "@rectangular-labs/ui/core/checkbox";
import { FieldError } from "@rectangular-labs/ui/core/field";
import { Input } from "@rectangular-labs/ui/core/input";
import { type } from "arktype";

// ─── Props ───────────────────────────────────────────────────────────────────

export type RecoverAccountFormProps = {
  onSubmit: (values: { code: string; trustDevice?: boolean | undefined }) => Promise<AuthResult>;
};

// ─── Component ───────────────────────────────────────────────────────────────

const backupCodeSchema = type({ code: "string > 0", trustDevice: "boolean?" });

export function RecoverAccountForm({ onSubmit }: RecoverAccountFormProps) {
  const form = useAppForm({
    defaultValues: { code: "", trustDevice: false },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await onSubmit({
        code: value.code,
        trustDevice: value.trustDevice || undefined,
      });

      handleFormResultError<typeof value>(formApi, result, {
        resetFields: ["code"],
      });

      return result;
    },
    validators: {
      onChange: backupCodeSchema,
      onSubmit: backupCodeSchema,
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
            <field.FieldShell label="Backup code">
              <Input
                autoComplete="off"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.currentTarget.value as never);
                }}
                placeholder="Your backup code"
                value={field.state.value}
              />
            </field.FieldShell>
          )}
        </form.AppField>

        <form.AppField name="trustDevice">
          {(field) => (
            <field.FieldShell label="Trust this device" orientation="horizontal-start">
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

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton>Recover account</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
