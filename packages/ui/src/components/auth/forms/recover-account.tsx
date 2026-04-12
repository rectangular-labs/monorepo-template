"use client";

import { type } from "arktype";
import { Checkbox } from "../../core/checkbox";
import { FieldError } from "../../core/field";
import { Input } from "../../core/input";
import {
  clearFormError,
  setFieldError,
  setFormError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import type { AuthResult } from "@rectangular-labs/auth/adapter/types";

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

      if (result.type === "error") {
        if (result.field) {
          setFieldError<typeof value>(formApi, result.field as keyof typeof value, result.message);
        } else {
          setFormError(formApi, result.message);
        }
        formApi.resetField("code");
      }

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
