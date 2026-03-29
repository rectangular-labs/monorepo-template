"use client";

import { type } from "arktype";
import { PaperPlaneTiltIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearFormError, setFieldError, useAppForm } from "../../ui/tanstack-form";
import { Button } from "../../core/button";
import { toast } from "../../core/sonner";
import { type AuthViewPath, useAuth } from "../auth-provider";
import { OTPInputGroup } from "../otp-input-group";

export function TwoFactorForm({ setView }: { setView: (view: AuthViewPath) => void }) {
  const { authClient, successHandler, viewPaths } = useAuth();
  const auth = authClient as any;
  const { data: session, isPending: isLoadingSession } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [coolDownSeconds, setCoolDownSeconds] = useState(0);
  const [method] = useState<"totp" | "otp" | null>(null);
  const initialSendRef = useRef(false);

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
      if (isLoadingSession) {
        return;
      }

      if ((session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled) {
        toast.error("User already has two-factor enabled.");
        return;
      }

      setIsSubmitting(true);
      const verifyMethod = method === "otp" ? auth.twoFactor.verifyOtp : auth.twoFactor.verifyTotp;

      const response = await verifyMethod({
        code: value.code,
        trustDevice: value.trustDevice,
      });
      setIsSubmitting(false);

      if (response.error) {
        setFieldError<typeof schema.infer>(
          formApi,
          "code",
          response.error.message ?? "Invalid code. Try again.",
        );
        formApi.resetField("code");
        return;
      }

      toast.success("Two-factor authentication enabled successfully");
      void successHandler();
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
    if (isSendingOtp) return;
    if (coolDownSeconds > 0) {
      toast.info(`Please wait ${coolDownSeconds} seconds before requesting the code again`);
      return;
    }

    setIsSendingOtp(true);
    const response = await auth.twoFactor.sendOtp();
    setIsSendingOtp(false);

    if (response.error) {
      setFieldError<{ code: string }>(
        form,
        "code",
        response.error.message ?? "Failed to send code",
      );
      return;
    }

    setCoolDownSeconds(60);
    initialSendRef.current = false;
  }, [auth, coolDownSeconds, form, isSendingOtp]);

  useEffect(() => {
    if (method === "otp" && coolDownSeconds <= 0 && !initialSendRef.current) {
      initialSendRef.current = true;
      void sendOtp();
    }
  }, [coolDownSeconds, method, sendOtp]);

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
          <Button
            className="px-0"
            onClick={() => setView(viewPaths.RECOVER_ACCOUNT)}
            type="button"
            variant="link"
          >
            Forgot authenticator?
          </Button>
        </div>

        <form.AppField name="code">
          {(field) => (
            <field.OtpField
              disabled={isSubmitting}
              field={field}
              onComplete={() => {
                void form.handleSubmit();
              }}
            >
              <OTPInputGroup otpSeparators={2} />
            </field.OtpField>
          )}
        </form.AppField>

        <form.AppField name="trustDevice">
          {(field) => (
            <field.CheckboxField disabled={isSubmitting} field={field} label="Trust this device" />
          )}
        </form.AppField>

        <div className="grid gap-4">
          <form.SubmitButton>Verify</form.SubmitButton>

          <Button
            disabled={coolDownSeconds > 0 || isSendingOtp || isSubmitting}
            onClick={() => {
              void sendOtp();
            }}
            type="button"
            variant="outline"
          >
            {isSendingOtp ? <SpinnerIcon className="animate-spin" /> : <PaperPlaneTiltIcon />}
            Resend code{coolDownSeconds > 0 ? ` (${coolDownSeconds})` : ""}
          </Button>
        </div>
      </form>
    </form.AppForm>
  );
}
