"use client";

import { type } from "arktype";
import { useState } from "react";
import { Button } from "../../core/button";
import { FieldError } from "../../core/field";
import { toast } from "../../core/sonner";
import { clearFormError, setFormError, toFieldErrors, useAppForm } from "../../ui/tanstack-form";
import { type AuthViewPath, useAuth } from "../auth-provider";
import { OTPInputGroup } from "../otp-input-group";
import { CodeSchema } from "../schema/code";

export type VerificationMode =
  | "phone-code"
  | "password-reset-phone-code"
  | "email-code"
  | "password-reset-email-code"
  | "verification-email-code"
  | "magic-link-token"
  | "password-reset-token"
  | "verification-email-token";

export interface VerificationInfo {
  identifier: string;
  mode: VerificationMode;
  code?: string | undefined;
}

type VerificationFormProps = {
  isDisabled?: boolean;
  setVerificationInfo: (info: VerificationInfo | null) => void;
  setView: (view: AuthViewPath) => void;
} & VerificationInfo;

export function VerificationForm({
  mode,
  identifier,
  isDisabled,
  setView,
  setVerificationInfo,
}: VerificationFormProps) {
  const {
    authClient,
    viewPaths,
    successHandler,
    successCallbackURL,
    errorCallbackURL,
    newUserCallbackURL,
    resetPasswordCallbackURL,
  } = useAuth();
  const auth = authClient as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const needsCode = mode.endsWith("code");
  const isPhone = mode.includes("phone");
  const isEmail = !isPhone;
  const verificationType = needsCode ? "code" : "link";
  const codeSchema = type({ code: needsCode ? CodeSchema : type("undefined") });

  const form = useAppForm({
    defaultValues: {
      code: "",
    },
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      if (
        mode === "magic-link-token" ||
        mode === "password-reset-token" ||
        mode === "verification-email-token"
      ) {
        return;
      }

      if (!value.code) {
        throw new Error("Code is required");
      }

      setIsSubmitting(true);

      const response = await (() => {
        switch (mode) {
          case "email-code":
            return auth.signIn.emailOtp({
              email: identifier,
              otp: value.code,
            });
          case "phone-code":
            return auth.phoneNumber.verify({
              code: value.code,
              disableSession: false,
              phoneNumber: identifier,
            });
          case "password-reset-phone-code":
            return;
          case "password-reset-email-code":
            return auth.emailOtp.checkVerificationOtp({
              email: identifier,
              otp: value.code,
              type: "forget-password",
            });
          case "verification-email-code":
            return auth.emailOtp.verifyEmail({
              email: identifier,
              otp: value.code,
            });
          default: {
            const _never: never = mode;
            throw new Error("Invalid verification type");
          }
        }
      })();

      setIsSubmitting(false);

      if (response?.error) {
        if (response.error.status === 404) {
          setFormError(formApi, "Route not found. Have you enabled the emailOTP plugin?");
          return;
        }

        setFormError(
          formApi,
          response.error.message ??
            "Something went wrong verifying your code. Please try again later.",
        );
        return;
      }

      if (mode === "email-code" || mode === "verification-email-code" || mode === "phone-code") {
        await successHandler();
        return;
      }

      if (mode === "password-reset-email-code" || mode === "password-reset-phone-code") {
        setView(viewPaths.RESET_PASSWORD);
        setVerificationInfo({
          code: value.code,
          identifier,
          mode,
        });
      }
    },
    validators: {
      onChange: codeSchema,
      onSubmit: codeSchema,
    },
  });

  const openEmail = () => {
    window.open("mailto:", "_self");
  };

  async function resendCode() {
    setIsSubmitting(true);
    const response = await (() => {
      switch (mode) {
        case "email-code":
          return auth.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "sign-in",
          });
        case "phone-code":
          return auth.phoneNumber.sendOtp({
            phoneNumber: identifier,
          });
        case "password-reset-phone-code":
          return auth.phoneNumber.requestPasswordReset({
            phoneNumber: identifier,
          });
        case "password-reset-email-code":
          return auth.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "forget-password",
          });
        case "verification-email-code":
          return auth.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "email-verification",
          });
        case "magic-link-token":
          return auth.signIn.magicLink({
            callbackURL: successCallbackURL,
            email: identifier,
            errorCallbackURL,
            newUserCallbackURL,
          });
        case "password-reset-token":
          return authClient.requestPasswordReset({
            email: identifier,
            redirectTo: resetPasswordCallbackURL,
          });
        case "verification-email-token":
          return authClient.sendVerificationEmail({
            callbackURL: successCallbackURL,
            email: identifier,
          });
      }
    })();
    setIsSubmitting(false);

    if (response?.error) {
      toast.error(
        response.error.message ??
          "Something went wrong resending your code. Please try again later.",
      );
    }
  }

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
            <form.AppField name="code">
              {(field) => (
                <field.OtpField
                  disabled={isSubmitting || isDisabled}
                  field={field}
                  label="One-time code"
                  onComplete={() => {
                    void form.handleSubmit();
                  }}
                >
                  <OTPInputGroup otpSeparators={1} />
                </field.OtpField>
              )}
            </form.AppField>

            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
              {(error) => <FieldError errors={toFieldErrors(error)} />}
            </form.Subscribe>

            <form.SubmitButton disabled={isDisabled}>Verify code</form.SubmitButton>
          </form>
        </form.AppForm>
      ) : null}

      {isEmail && !needsCode ? (
        <Button
          className="w-full"
          disabled={isSubmitting || isDisabled}
          onClick={openEmail}
          type="button"
        >
          Open Email
        </Button>
      ) : null}

      <div className="flex items-center gap-2 text-sm">
        Didn't receive a {verificationType}?{" "}
        <Button
          className="px-0"
          disabled={isSubmitting || isDisabled}
          onClick={() => {
            void resendCode();
          }}
          type="button"
          variant="link"
        >
          Resend {verificationType}
        </Button>
      </div>
    </div>
  );
}
