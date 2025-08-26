"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { type AuthViewPath, useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";
import type { VerificationInfo } from "./verification-form";

export function SignInForm({
  setView,
  shouldDisable,
  setShouldDisable,
  setVerificationInfo,
}: {
  setView: (view: AuthViewPath) => void;
  shouldDisable: boolean;
  setShouldDisable: (disabled: boolean) => void;
  setVerificationInfo: (verificationInfo: VerificationInfo) => void;
}) {
  const { authClient, viewPaths, credentials, successHandler } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameEnabled = credentials?.useUsername;
  const rememberMeEnabled = credentials?.enableRememberMe;
  const schema = type({
    email: usernameEnabled ? "string > 0" : "string.email >= 1",
    password: "string > 0",
    rememberMe: "boolean",
  });

  const form = useForm<typeof schema.infer>({
    resolver: arktypeResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: !rememberMeEnabled,
    },
  });

  async function signIn({ email, password, rememberMe }: typeof schema.infer) {
    setShouldDisable(true);
    setIsSubmitting(true);
    const response = await (async () => {
      if (usernameEnabled) {
        return await authClient.signIn.username({
          username: email,
          password,
          rememberMe,
        });
      } else {
        return await authClient.signIn.email({
          email,
          password,
          rememberMe,
        });
      }
    })();
    setIsSubmitting(false);
    setShouldDisable(false);

    if (response.error) {
      if (response.error.status === 403) {
        // Redirect to verify email address
        if (credentials?.verificationMode === "code") {
          setView(viewPaths.IDENTITY_VERIFICATION);
          setVerificationInfo({
            mode: "verification-email-code",
            identifier: email,
          });
        }
        if (credentials?.verificationMode === "token") {
          setView(viewPaths.IDENTITY_VERIFICATION);
          setVerificationInfo({
            mode: "verification-email-token",
            identifier: email,
          });
        }
        return;
      }

      form.setError("root", {
        message:
          response.error.message ??
          "Something went wrong. Please try again later.",
      });
      return;
    }

    if ("twoFactorRedirect" in response.data) {
      setView(viewPaths.TWO_FACTOR);
      return;
    }
    await successHandler();
  }

  if (!credentials) {
    console.warn(
      "Rendering the sign in form but credentials was set to `undefined` in the `AuthProvider`.",
    );
    return null;
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(signIn)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{usernameEnabled ? "Username" : "Email"}</FormLabel>

              <FormControl>
                <Input
                  autoComplete={
                    usernameEnabled ? "username webauthn" : "email webauthn"
                  }
                  disabled={isSubmitting || shouldDisable}
                  placeholder={
                    usernameEnabled ? "Enter your username" : "Enter your email"
                  }
                  type={usernameEnabled ? "text" : "email"}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>

                {credentials?.enableForgotPassword && (
                  <Button
                    className="px-0"
                    onClick={() => setView(viewPaths.FORGOT_PASSWORD)}
                    type="button"
                    variant="link"
                  >
                    Forgot password?
                  </Button>
                )}
              </div>

              <FormControl>
                <PasswordInput
                  autoComplete="current-password webauthn"
                  disabled={isSubmitting || shouldDisable}
                  placeholder="Your password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {rememberMeEnabled && (
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting || shouldDisable}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Remember me</FormLabel>
              </FormItem>
            )}
          />
        )}
        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        <Button
          className={"w-full"}
          disabled={isSubmitting || shouldDisable}
          type="submit"
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </Form>
  );
}
