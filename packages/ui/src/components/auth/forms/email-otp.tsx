"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
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
import { Input } from "../../ui/input";
import { InputOTP, OTPInputGroup } from "../../ui/input-otp";
import { toast } from "../../ui/sonner";
import { useAuth } from "../auth-provider";

export function EmailOTPForm() {
  const [email, setEmail] = useState<string | undefined>();

  if (!email) {
    return <EmailForm setEmail={setEmail} />;
  }

  return <OTPForm email={email} />;
}

function EmailForm({ setEmail }: { setEmail: (email: string) => void }) {
  const { authClient, isSubmitting, setIsSubmitting } = useAuth();

  const schema = type({ email: "string.email >= 1" });
  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: { email: "" },
  });

  async function sendEmailOTP({ email }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setIsSubmitting(false);

    if (response.error) {
      form.setError("root", {
        message: response.error.message ?? "Failed to send code",
      });
      return;
    }

    toast.success("Please check your email for the verification code.");
    setEmail(email);
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(sendEmailOTP)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input
                  autoComplete="email webauthn"
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-destructive text-sm" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button className={"w-full"} isLoading={isSubmitting} type="submit">
          Send code
        </Button>
      </form>
    </Form>
  );
}

export function OTPForm({ email }: { email: string }) {
  const { authClient, isSubmitting, setIsSubmitting, onSuccess } = useAuth();

  const schema = type({ code: "string.numeric" }).narrow(({ code }, ctx) => {
    if (code.length !== 6) {
      return ctx.reject({ expected: "a valid otp", actual: "" });
    }
    return true;
  });

  const form = useForm<typeof schema.infer>({
    resolver: arktypeResolver(schema),
    defaultValues: { code: "" },
  });

  async function verifyCode({ code }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });
    setIsSubmitting(false);

    if (response.error) {
      form.setError("code", {
        message: response.error.message ?? "Invalid code. Try again.",
      });
      form.resetField("code");
      return;
    }

    // TODO: handle success / redirect to callbackURL
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(verifyCode)}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-time code</FormLabel>

              <FormControl>
                <InputOTP
                  {...field}
                  disabled={isSubmitting}
                  maxLength={6}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  onComplete={form.handleSubmit(verifyCode)}
                >
                  <OTPInputGroup otpSeparators={2} />
                </InputOTP>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button isLoading={isSubmitting} type="submit">
          Verify code
        </Button>
      </form>
    </Form>
  );
}
