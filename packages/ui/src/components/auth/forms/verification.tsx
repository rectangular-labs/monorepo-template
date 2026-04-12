"use client";

import type { AuthResult, VerificationInfo } from "@rectangular-labs/auth/adapter/types";
import { type } from "arktype";
import { Button } from "../../core/button";
import { FieldError } from "../../core/field";
import {
  clearFormError,
  handleFormResultError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import { ResendVerification } from "../core/resend-verification";
import { OTPCodeFieldGroup } from "../field-groups/otp-code";
import { CodeSchema } from "../schema/code";

export type VerificationFormProps = {
  info: VerificationInfo;
  onSubmit: (values: { code: string }) => Promise<AuthResult>;
  onResend: () => Promise<AuthResult>;
};

export function VerificationForm({ info, onSubmit, onResend }: VerificationFormProps) {
  const needsCode = info.mode.endsWith("code");
  const isPhone = info.mode.includes("phone");
  const isEmail = !isPhone;
  const verificationType = needsCode ? "code" : "link";

  const codeSchema = type({ code: needsCode ? CodeSchema : type("undefined") });

  const form = useAppForm({
    defaultValues: { code: "" },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      if (!needsCode) {
        return;
      }

      if (!value.code) {
        throw new Error("Code is required");
      }

      const result = await onSubmit({ code: value.code });

      handleFormResultError<typeof value>(formApi, result);

      return result;
    },
    validators: {
      onSubmit: codeSchema,
    },
  });

  const openEmail = () => {
    window.open("mailto:", "_self");
  };

  return (
    <div className="grid w-full">
      {needsCode ? (
        <form.AppForm>
          <form
            className="grid w-full gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <OTPCodeFieldGroup
              fields={{ code: "code" }}
              form={form}
              label="Verification code"
              maxLength={6}
              onComplete={() => {
                void form.handleSubmit();
              }}
            />

            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
              {(error) => <FieldError errors={toFieldErrors(error)} />}
            </form.Subscribe>

            <form.SubmitButton>Verify code</form.SubmitButton>
          </form>
        </form.AppForm>
      ) : null}

      {isEmail && !needsCode ? (
        <Button className="w-full" onClick={openEmail} type="button">
          Open Email
        </Button>
      ) : null}

      <ResendVerification item={verificationType} onResend={onResend} />
    </div>
  );
}
