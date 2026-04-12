"use client";

import { type } from "arktype";
import { PaperPlaneTiltIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { Checkbox } from "../../core/checkbox";
import { FieldError } from "../../core/field";
import {
  clearFormError,
  setFieldError,
  setFormError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import { Button } from "../../core/button";
import { OTPCodeFieldGroup } from "../field-groups/otp-code";
import type { AuthResult } from "@rectangular-labs/auth/adapter/types";

// ─── Props ───────────────────────────────────────────────────────────────────

export type TwoFactorFormProps = {
  onSubmit: (values: { code: string; trustDevice?: boolean | undefined }) => Promise<AuthResult>;
  onSendOtp?: ((values: { trustDevice?: boolean | undefined }) => Promise<void>) | undefined;
  onRecoverAccount?: (() => void) | undefined;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TwoFactorForm({ onSubmit, onSendOtp, onRecoverAccount }: TwoFactorFormProps) {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [coolDownSeconds, setCoolDownSeconds] = useState(0);

  const schema = type({
    code: "string.numeric",
    trustDevice: "boolean?",
  }).narrow(({ code }, ctx) => {
    if (code.length !== 6) {
      return ctx.reject({ expected: "a valid code", actual: "" });
    }
    return true;
  });

  const form = useAppForm({
    defaultValues: {
      code: "",
      trustDevice: false,
    },
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
      onChange: schema,
      onSubmit: schema,
    },
  });

  useEffect(() => {
    if (coolDownSeconds <= 0) return;
    const timer = setTimeout(() => setCoolDownSeconds((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [coolDownSeconds]);

  const sendOtp = useCallback(async () => {
    if (!onSendOtp || isSendingOtp || coolDownSeconds > 0) return;

    setIsSendingOtp(true);
    try {
      await onSendOtp({
        trustDevice: form.getFieldValue("trustDevice") || undefined,
      });
      setCoolDownSeconds(60);
    } finally {
      setIsSendingOtp(false);
    }
  }, [onSendOtp, coolDownSeconds, form, isSendingOtp]);

  return (
    <form.AppForm>
      <form
        className="grid w-full gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">One-time password</span>
          {onRecoverAccount ? (
            <Button className="px-0" onClick={onRecoverAccount} type="button" variant="link">
              Forgot authenticator?
            </Button>
          ) : null}
        </div>

        <OTPCodeFieldGroup
          fields={{ code: "code" }}
          form={form}
          label="One-time password"
          maxLength={6}
          onComplete={() => {
            void form.handleSubmit();
          }}
        />

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

        <div className="grid gap-4">
          <form.SubmitButton>Verify</form.SubmitButton>

          {onSendOtp ? (
            <Button
              disabled={coolDownSeconds > 0 || isSendingOtp}
              onClick={() => {
                void sendOtp();
              }}
              type="button"
              variant="outline"
            >
              {isSendingOtp ? <SpinnerIcon className="animate-spin" /> : <PaperPlaneTiltIcon />}
              Resend code{coolDownSeconds > 0 ? ` (${coolDownSeconds})` : ""}
            </Button>
          ) : null}
        </div>
      </form>
    </form.AppForm>
  );
}
