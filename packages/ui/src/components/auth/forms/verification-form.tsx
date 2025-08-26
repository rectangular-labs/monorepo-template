"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { InputOTP } from "../../ui/input-otp";
import { toast } from "../../ui/sonner";
import { useAuth } from "../auth-provider";
import { OTPInputGroup } from "../otp-input-group";
import { CodeSchema } from "../schema/code";

export type VerificationMode =
  | "code"
  | "password-reset-code"
  | "verification-email-code"
  | "magic-link-token"
  | "password-reset-token"
  | "verification-email-token";

const typeText: Record<VerificationMode, string> = {
  "verification-email-token": "verification link",
  "verification-email-code": "verification code",
  "password-reset-token": "password reset link",
  "password-reset-code": "password reset code",
  "magic-link-token": "sign-in link",
  code: "verification code",
};

export interface VerificationInfo {
  mode: VerificationMode;
  medium: "email" | "phone";
  identifier: string;
}

type VerificationFormProps = {
  isDisabled?: boolean;
  onComplete?:
    | ((result: {
        identifier: string;
        mode: VerificationMode;
        medium: "email" | "phone";
        code: string | undefined;
      }) => void)
    | undefined;
} & VerificationInfo;

export function VerificationForm({
  mode,
  medium,
  identifier,
  isDisabled,
  onComplete,
}: VerificationFormProps) {
  const {
    authClient,
    successCallbackURL,
    errorCallbackURL,
    newUserCallbackURL,
    resetPasswordCallbackURL,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const needsCode = mode.endsWith("code");

  const codeSchema = type({ code: needsCode ? CodeSchema : type("undefined") });
  const form = useForm({
    resolver: arktypeResolver(codeSchema),
  });

  const openEmail = () => {
    window.open("mailto:", "_self");
  };
  const openMessages = () => {
    window.open("sms:", "_self");
  };

  async function handleComplete(values: typeof codeSchema.infer) {
    setIsSubmitting(true);
    const response = await (() => {
      if (
        mode === "magic-link-token" ||
        mode === "password-reset-token" ||
        mode === "verification-email-token"
      ) {
        // There isn't anything to be done with token based verification types.
        // User will click the link in their email or SMS and be redirected to the app.
        return;
      }

      if (!values.code) {
        // This should never happen, since the form validation should prevent this. Mostly for typescript linting.
        throw new Error("Code is required");
      }

      switch (mode) {
        case "code": {
          return authClient.signIn.emailOtp({
            otp: values.code,
            email: identifier,
          });
        }
        case "password-reset-code": {
          return authClient.emailOtp.checkVerificationOtp({
            otp: values.code,
            email: identifier,
            type: "forget-password",
          });
        }
        case "verification-email-code": {
          return authClient.emailOtp.verifyEmail({
            otp: values.code,
            email: identifier,
          });
        }
        default: {
          const _never: never = mode;
          throw new Error("Invalid verification type");
        }
      }
    })();
    setIsSubmitting(false);
    if (response?.error) {
      if (response.error.status === 404) {
        form.setError("root", {
          message: "Route not found. Have you enabled the emailOTP plugin?",
        });
        return;
      }
      form.setError("root", {
        message:
          response.error.message ??
          "Something went wrong verifying your code. Please try again later.",
      });
      return;
    }

    onComplete?.({ mode, identifier, medium, code: values.code });
  }

  async function resendCode() {
    setIsSubmitting(true);
    const response = await (() => {
      switch (mode) {
        case "code": {
          return authClient.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "sign-in",
          });
        }
        case "password-reset-code": {
          return authClient.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "forget-password",
          });
        }
        case "verification-email-code": {
          return authClient.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "email-verification",
          });
        }
        case "magic-link-token": {
          return authClient.signIn.magicLink({
            email: identifier,
            callbackURL: successCallbackURL,
            errorCallbackURL,
            newUserCallbackURL,
          });
        }
        case "password-reset-token": {
          return authClient.requestPasswordReset({
            email: identifier,
            redirectTo: resetPasswordCallbackURL,
          });
        }
        case "verification-email-token": {
          return authClient.sendVerificationEmail({
            email: identifier,
            callbackURL: successCallbackURL,
          });
        }
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
      <div className="flex flex-col gap-1 pb-6">
        <p className="font-semibold text-2xl">Check your {medium}</p>
        <p className="text-muted-foreground text-sm">
          We sent a {typeText[mode]} to{" "}
          <a
            className="font-medium text-primary underline"
            href={`${medium === "email" ? "mailto:" : "sms:"}${identifier}`}
          >
            {identifier}
          </a>
        </p>
      </div>

      {needsCode && (
        <Form {...form}>
          <form
            className={"grid w-full gap-6"}
            onSubmit={form.handleSubmit(handleComplete)}
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>One-time code</FormLabel>
                  <FormControl>
                    <InputOTP
                      disabled={isSubmitting || isDisabled}
                      maxLength={6}
                      onComplete={form.handleSubmit(handleComplete)}
                      {...field}
                      {...(value ? { value } : {})}
                    >
                      <OTPInputGroup otpSeparators={1} />
                    </InputOTP>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}

            <Button disabled={isSubmitting || isDisabled} type="submit">
              {isSubmitting && <Loader2 className="animate-spin" />}
              Verify code
            </Button>
          </form>
        </Form>
      )}
      {medium === "email" && !needsCode && (
        <Button
          className="w-full"
          disabled={isSubmitting || isDisabled}
          onClick={openEmail}
          type="button"
        >
          Open Email
        </Button>
      )}
      {medium === "phone" && !needsCode && (
        <Button
          className="w-full"
          disabled={isSubmitting || isDisabled}
          onClick={openMessages}
          type="button"
        >
          Open Phone
        </Button>
      )}
      <div className="flex items-center gap-2 text-sm">
        Didn't receive a code?{" "}
        <Button
          className="px-0"
          disabled={isSubmitting || isDisabled}
          onClick={resendCode}
          type="button"
          variant="link"
        >
          Resend code
        </Button>
      </div>
    </div>
  );
}
