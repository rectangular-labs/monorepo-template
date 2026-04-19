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
import { CodeSchema } from "../../schema/code";
import { PasswordSchema } from "../../schema/password";
import { ResendVerification } from "../core/resend-verification";
import { OTPCodeFieldGroup } from "../field-groups/otp-code";
import { PasswordFieldGroup } from "../field-groups/password";

export type ResetPasswordFormProps = {
  showConfirmPassword?: boolean;
} & (
  | {
      verificationType: "token";
      onSubmit: (values: { newPassword: string }) => Promise<AuthResult>;
      onResend?: never;
    }
  | {
      verificationType: "code";
      onSubmit: (values: { code: string; newPassword: string }) => Promise<AuthResult>;
      onResend?: () => Promise<AuthResult>;
    }
);

export function ResetPasswordForm(props: ResetPasswordFormProps) {
  const requiresCode = props.verificationType === "code";
  const { showConfirmPassword = true } = props;
  const schema = type({
    code: requiresCode ? CodeSchema : type("string"),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  });

  const form = useAppForm({
    defaultValues: {
      code: "",
      confirmPassword: "",
      password: "",
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      const result = await (requiresCode
        ? props.onSubmit({
            code: value.code,
            newPassword: value.password,
          })
        : props.onSubmit({
            newPassword: value.password,
          }));

      handleFormResultError<typeof value>(formApi, result, {
        focusInvalidField: true,
        password: {
          enabled: true,
          confirmField: showConfirmPassword ? "confirmPassword" : undefined,
        },
      });

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
        {requiresCode ? (
          <OTPCodeFieldGroup
            fields={{ code: "code" }}
            form={form}
            label="Verification code"
            maxLength={6}
          />
        ) : null}

        <PasswordFieldGroup
          fields={{
            password: "password",
            confirmPassword: "confirmPassword",
          }}
          form={form}
          label="New password"
          placeholder="At least 8 characters"
          showConfirmPassword
        />

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <div className="space-y-1">
          <form.SubmitButton className="w-full">Reset password</form.SubmitButton>
          {props.onResend ? <ResendVerification item="code" onResend={props.onResend} /> : null}
        </div>
      </form>
    </form.AppForm>
  );
}
