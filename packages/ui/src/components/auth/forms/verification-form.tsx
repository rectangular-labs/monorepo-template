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
  mode: VerificationMode;
  identifier: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const needsCode = mode.endsWith("code");

  const codeSchema = type({ code: needsCode ? CodeSchema : type("undefined") });
  const form = useForm({
    resolver: arktypeResolver(codeSchema),
  });

  const isPhone = mode.includes("phone");
  const isEmail = !isPhone;

  const verificationType = needsCode ? "code" : "link";

  const openEmail = () => {
    window.open("mailto:", "_self");
  };

  async function handleComplete(values: typeof codeSchema.infer) {
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

    setIsSubmitting(true);
    const response = await (() => {
      switch (mode) {
        case "email-code": {
          return authClient.signIn.emailOtp({
            otp: values.code,
            email: identifier,
          });
        }
        case "phone-code": {
          return authClient.phoneNumber.verify({
            code: values.code,
            phoneNumber: identifier,
            disableSession: false,
          });
        }
        case "password-reset-phone-code": {
          // no otp verification for password reset phone code for some reason.
          return;
        }
        case "password-reset-email-code": {
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
    if (
      mode === "email-code" ||
      mode === "verification-email-code" ||
      mode === "phone-code"
    ) {
      //email otp login, and email verification are completed here.
      await successHandler();
      return;
    }
    if (
      mode === "password-reset-email-code" ||
      mode === "password-reset-phone-code"
    ) {
      //password reset needs to allow users to enter a new password.
      setView(viewPaths.RESET_PASSWORD);
      setVerificationInfo({
        mode,
        identifier,
        code: values.code,
      });
      return;
    }
  }

  async function resendCode() {
    setIsSubmitting(true);
    const response = await (() => {
      switch (mode) {
        case "email-code": {
          return authClient.emailOtp.sendVerificationOtp({
            email: identifier,
            type: "sign-in",
          });
        }
        case "phone-code": {
          return authClient.phoneNumber.sendOtp({
            phoneNumber: identifier,
          });
        }
        case "password-reset-phone-code": {
          return authClient.phoneNumber.requestPasswordReset({
            phoneNumber: identifier,
          });
        }
        case "password-reset-email-code": {
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
      {isEmail && !needsCode && (
        <Button
          className="w-full"
          disabled={isSubmitting || isDisabled}
          onClick={openEmail}
          type="button"
        >
          Open Email
        </Button>
      )}
      <div className="flex items-center gap-2 text-sm">
        Didn't receive a {verificationType}?{" "}
        <Button
          className="px-0"
          disabled={isSubmitting || isDisabled}
          onClick={resendCode}
          type="button"
          variant="link"
        >
          Resend {verificationType}
        </Button>
      </div>
    </div>
  );
}
